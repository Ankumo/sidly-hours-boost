import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression } from '@nestjs/schedule';
import {
    ApiErr,
    SteamAppLocale,
    SteamAppLocaleRecord,
    StringMap,
} from '@shared/types';
import chalk from 'chalk';
import { CronJob } from 'cron';
import { IdsDTO } from 'src/defaults/dto';
import { AppRequest } from 'src/defaults/types';
import config from 'src/utils/config';
import { Res } from 'src/utils/res';
import { DeepPartial } from 'typeorm';
import { AccountService } from '../Account/account.service';
import { MetadataService } from '../Metadata/metadata.service';
import { SteamApiService } from '../SteamApi/steam-api.service';
import { SteamApp } from './entities/steam-app.entity';
import { SteamAppRepository } from './steam-app.repository';

@Injectable()
export class SteamAppService implements OnApplicationBootstrap {
    private gamesCache: Record<string, number[]> = {};

    constructor(
        private repo: SteamAppRepository,
        private steamApi: SteamApiService,
        private accService: AccountService,
        private metaService: MetadataService,
    ) {
        if (config.updateAppsInfo) {
            const job = new CronJob(
                CronExpression.EVERY_DAY_AT_MIDNIGHT,
                async () => {
                    console.log(`Updating Steam games library...`);
                    await this.grabGames();
                },
            );

            job.start();
        }
    }

    clearCache(steamId: string) {
        if (this.gamesCache[steamId]) {
            delete this.gamesCache[steamId];
        }
    }

    async grabGames() {
        let apps: Error | DeepPartial<SteamApp>[];

        const meta = await this.metaService.getMetadata();

        let err: Error;
        let last_appid: number;
        let total = 0;

        do {
            const response = await this.steamApi.request('app_list', {
                if_modified_since: meta.lastGamesUpdate,
                include_software: true,
                max_results: 40000,
                last_appid,
            });

            if (response instanceof Error) {
                err = response;
                break;
            }

            const apps = response?.response?.apps || [];

            if (apps.length === 0) {
                break;
            }

            total += apps.length;

            const slices = 100;
            const sliceSize = apps.length / slices;

            for (let i = 0; i < slices; i++) {
                const start = i * sliceSize;
                const slice = apps
                    .slice(start, start + sliceSize)
                    .map((app) => ({ ...app, localeCache: '' }));

                await this.repo.save(slice);
            }

            const haveMoreResults =
                response?.response?.have_more_results || false;

            if (!haveMoreResults) {
                break;
            }

            last_appid = response.response.last_appid;
        } while (true);

        if (err) {
            console.log(
                chalk.redBright(`Unable to grab games list from Steam`, apps),
            );

            return;
        }

        if (total === 0) {
            console.log(chalk.yellowBright(`No games has been grabbed`));
        } else {
            console.log(
                `Successfully cached ${chalk.yellowBright(total)} Steam games`,
            );
        }

        meta.lastGamesUpdate = Date.now();
        await meta.save();
    }

    async search(text: string, accountId: number, req: AppRequest) {
        const query = this.repo
            .createQueryBuilder('app')
            .select(['app.name', 'app.appid'])
            .where('(app.name LIKE :partText OR app.appid = :text)', {
                partText: `%${text}%`,
                text,
            })
            .orderBy('lower(app.name) = :text', 'DESC')
            .take(6);

        if (accountId > 0) {
            const account = await this.accService.getAccessiveAccount(
                accountId,
                req,
                ['id', 'username', 'steamID'],
            );

            if (!account) {
                return new Res(false, ApiErr.AccountNotFound);
            }

            let appids = [];

            if (!this.gamesCache[account.steamID]) {
                const bot = await this.accService.getBot(
                    account.username,
                    false,
                );

                let steamID = '';

                if (bot && bot.loggedIn) {
                    appids = bot.ownedGames || [];
                    steamID = bot.steamID;
                } else {
                    if (!account.steamID) {
                        return new Res(false, ApiErr.BotNoSteamId);
                    }

                    steamID = account.steamID;

                    const response = await this.steamApi.request('owned_apps', {
                        steamid: account.steamID,
                        include_appinfo: false,
                    });

                    if (response instanceof Error) {
                        return new Res(false, ApiErr.SteamApiError, response);
                    }

                    if (response.response.games === undefined) {
                        return new Res(false, ApiErr.AccountIsPrivate);
                    }

                    appids = response.response.games.map((app) => app.appid);
                }

                if (steamID) {
                    this.gamesCache[steamID] = appids;
                }
            } else {
                appids = this.gamesCache[account.steamID];
            }

            query.andWhere('app.appid IN (:...appids)', { appids });
        }

        return new Res(true, await query.getMany());
    }

    async getByIds(dto: IdsDTO) {
        return new Res(
            true,
            await this.repo.findByIds(dto.ids, {
                select: ['appid', 'name'],
            }),
        );
    }

    async getAppLocalization(appid: number) {
        const app = await this.repo.findOne({
            where: {
                appid,
            },
        });

        let locale: null | SteamAppLocale = null;

        try {
            locale = JSON.parse(app.localeCache);
        } catch {
            const bot = this.accService.getAnyOnlineBot();

            if (!bot) {
                return new Res(false, ApiErr.NoOnlineBots);
            }

            const richPresence = await bot.getAppRichPresence(appid);

            if (richPresence instanceof Error) {
                return new Res(false, ApiErr.SteamApiError, richPresence);
            }

            locale = this.formatAppLocale(richPresence);

            app.localeCache = JSON.stringify(locale);
            await app.save();
        }

        return new Res(true, locale);
    }

    formatAppLocale(records: StringMap<string>): SteamAppLocale {
        const result: SteamAppLocale = {
            records: {},
            phValues: {},
        };

        const keys = Object.keys(records);

        for (const k of keys) {
            const v = records[k];
            const matches = v.match(/({#[^}]+})/gi);

            const record: SteamAppLocaleRecord = {
                customPhs: [],
                tPhs: [],
                text: v,
            };

            if (matches && matches.length) {
                matches.forEach((m) => {
                    let phs = m.match(/(%[^%]+%)/gi);
                    const fullKey = m.substring(1, m.length - 1);

                    if (phs && phs.length) {
                        const rx = new RegExp(
                            fullKey.replace(/%[^%]+%/gi, '(.+)'),
                            'gi',
                        );

                        phs = phs.map((ph) => ph.replace(/%/g, ''));

                        phs.forEach((ph) => {
                            if (!result.phValues[ph]) {
                                result.phValues[ph] = [];
                            }

                            if (!record.tPhs.includes(ph)) {
                                record.tPhs.push(ph);
                            }
                        });

                        keys.forEach((key) => {
                            const keyMatch = rx.exec(key);
                            rx.lastIndex = 0;

                            if (
                                keyMatch &&
                                phs.length + 1 === keyMatch.length
                            ) {
                                for (let i = 0; i < phs.length; i++) {
                                    const ph = phs[i];
                                    const val = keyMatch[i + 1];

                                    if (!result.phValues[ph].includes(val)) {
                                        result.phValues[ph].push(val);
                                    }
                                }
                            }
                        });
                    }
                });
            }

            const phMatches = v.replace(/{#[^}]+}/gi, '').match(/%[^%]+%/gi);

            if (phMatches && phMatches.length) {
                phMatches.forEach((m) => {
                    m = m.replace(/%/g, '');

                    if (!record.customPhs.includes(m)) {
                        record.customPhs.push(m);
                    }
                });
            }

            result.records[k] = record;
        }

        return result;
    }

    async onApplicationBootstrap() {
        const dbCount = await this.repo.count();

        if (dbCount === 0) {
            console.log(`Games DB is empty. Downloading...`);
            await this.grabGames();
        }
    }
}
