import { Account } from '../modules/Account/entities/account.entity';
import SteamUser, { EPersonaState, EResult } from 'steam-user';
import chalk from 'chalk';
import { DeepPartial, getCustomRepository } from 'typeorm';
import { AccountRepository } from '../modules/Account/account.repository';
import { EventsService } from '../modules/Events/events.service';
import { SSEDataEmitterHandler } from '../modules/Events/events.types';
import {
    PromiseType,
    SteamBotPersonaInfo,
    BotCallbackData,
    StringMap,
} from '@shared/types';
import { sleep } from '@shared/utils';
import { pick } from '.';
import { SteamApiService } from '../modules/SteamApi/steam-api.service';
import { SteamAppRepository } from '../modules/SteamApp/steam-app.repository';
import { SteamApp } from '../modules/SteamApp/entities/steam-app.entity';

type BotLogInPromiseResolver = <K extends keyof BotCallbackData>(
    value: [K, BotCallbackData[K]] | [K],
) => void;

type SteamUserEvent = Parameters<SteamUser['on']>[0];
type SteamUserProfileItems = PromiseType<
    ReturnType<SteamUser['getOwnedProfileItems']>
>;
type SteamUserProfileItem = SteamUserProfileItems['animated_avatars'][0];
type SteamUserEquippedItems = Record<
    | 'profile_background'
    | 'mini_profile_background'
    | 'avatar_frame'
    | 'animated_avatars'
    | 'profile_modifiers',
    SteamUserProfileItem
>;

type SteamUserProfileItemCheckObj = {
    [key in keyof DeepPartial<SteamBotPersonaInfo>]: keyof SteamUserEquippedItems;
};

type SteamUserError = {
    message: keyof typeof SteamUser.EResult;
    stack?: string;
    name: string;
};

const steamImageFields: (keyof SteamUserProfileItem)[] = [
    'movie_mp4',
    'movie_webm',
    'image_large',
    'image_small',
];

export class SteamBot {
    static sse: EventsService = null;
    static steamApi: SteamApiService = null;

    private steamUser: SteamUser;
    private _personaState: EPersonaState;
    private pendingGuardCallback: (code: string) => void | null = null;
    private awaitedEvents: SteamUserEvent[];
    private _ownedGames: number[] = null;
    private reset: NodeJS.Timeout;

    public lastActivity: number = Date.now();

    constructor(public account: Account) {
        this.steamUser = new SteamUser({
            autoRelogin: true,
            enablePicsCache: true,
            saveAppTickets: false,
        });

        this.awaitedEvents = ['loginKey', 'accountInfo'];
        this.initListeners();
    }

    get personaState(): EPersonaState {
        return this._personaState;
    }

    set personaState(value: EPersonaState) {
        this._personaState = value;
        this.steamUser.setPersona(value);
    }

    get steamID() {
        if (!this.steamUser.steamID) {
            return null;
        }

        return this.steamUser.steamID.getSteamID64();
    }

    get loggedIn() {
        return this.steamID !== null;
    }

    get username() {
        return this.account.username;
    }

    get ownedGames() {
        if (this._ownedGames === null) {
            this._ownedGames = this.steamUser.getOwnedApps();
        }

        return this._ownedGames;
    }

    get launched() {
        return this.loggedIn && this.account.launched;
    }

    get activeAppId() {
        return this.account.activeAppId;
    }

    set activeAppId(value: number) {
        this.account.activeAppId = value;
    }

    private initListeners() {
        this.steamUser.on('loginKey', async (loginKey) => {
            this.account.loginKey = loginKey;
            await this.updateAccount('loginKey');
        });

        this.steamUser.on('playingState', async (blocked, appId) => {
            if (!blocked) {
                appId = 0;
            }

            const relaunch =
                this.activeAppId === undefined ||
                (this.activeAppId > 0 && appId === 0);

            this.activeAppId = appId;

            if (relaunch && this.account.launched) {
                this.runBoost();
            }

            const appRepo = getCustomRepository(SteamAppRepository);
            let app = await appRepo.findOne({
                where: {
                    appid: this.activeAppId,
                },
                select: ['appid', 'name'],
            });

            if (!app) {
                app = {
                    appid: this.activeAppId,
                    name: '',
                } as SteamApp;
            }

            this.tellClients('update_cache', {
                apps: [app],
            });

            this.tellClients('account_state', {
                id: this.account.id,
                activeAppId: this.activeAppId,
            });
        });

        this.steamUser.on('disconnected', (res) => {
            this.tellOff();

            this.log(`disconnected [${chalk.yellowBright(EResult[res])}]`);

            this.steamUser.once('loggedOn', async () => {
                this.log('successfully re-logged on');
                this.steamUser.setPersona(EPersonaState.Offline);
                await sleep(1000);

                try {
                    this.steamUser.setPersona(this.personaState);
                } catch {}
            });
        });

        this.steamUser.on('accountInfo', async (name) => {
            this.account.info.name = name;

            if (this.awaitedEvents.includes('accountInfo')) {
                await this.updateAccount('accountInfo');
            } else {
                await this.account.save();
            }
        });

        this.steamUser.on('error', async (err: SteamUserError) => {
            if (err.message === 'LoggedInElsewhere') {
                await sleep(2000);
                this.logOn();
                return;
            }

            if (err.message === 'InvalidPassword') {
                return;
            }

            this.account.launched = false;
            this.account.lastError = err.message;
            this.account.save();

            this.tellOff(err.message);

            this.log(
                chalk.redBright(
                    `${chalk.yellowBright(err.message)} error occurred`,
                ),
            );
        });
    }

    logOn(guardCode?: string) {
        if (this.loggedIn) {
            return [
                'error',
                {
                    errCode: 'already_logged_in',
                },
            ];
        }

        if (guardCode !== undefined && this.pendingGuardCallback === null) {
            return [
                'error',
                {
                    errCode: 'no_pending_callback',
                },
            ];
        }

        return new Promise((r: BotLogInPromiseResolver) => {
            const onLoggedOn = async () => {
                this.account.password = null;
                this.pendingGuardCallback = null;
                this.personaState = this.account.personaState;
                this.account.steamID = this.steamID;
                await this.account.save();

                this.log('successfully logged on');
                this.steamUser.off('error', onError);
                this.steamUser.off('steamGuard', onSteamGuard);

                this.tellClients('account_state', {
                    id: this.account.id,
                    launched: this.account.launched || false,
                    loggedIn: true,
                });

                r(['success']);
            };

            const onError = (err: Error) => {
                this.steamUser.off('loggedOn', onLoggedOn);
                this.steamUser.off('steamGuard', onSteamGuard);

                r(['error', err]);
            };

            const onSteamGuard = (domain, codeCallback) => {
                this.pendingGuardCallback = codeCallback;

                this.steamUser.off('error', onError);
                this.steamUser.off('loggedOn', onLoggedOn);

                r([domain === null ? 'twofa' : 'guard']);
            };

            this.steamUser.once('loggedOn', onLoggedOn);
            this.steamUser.once('error', onError);
            this.steamUser.once('steamGuard', onSteamGuard);

            if (guardCode !== undefined) {
                this.pendingGuardCallback(guardCode);
            } else {
                this.steamUser.logOn({
                    rememberPassword: true,
                    machineName: 'sidly',
                    accountName: this.username,
                    ...(this.account.password
                        ? {
                              password: this.account.password,
                          }
                        : {
                              loginKey: this.account.loginKey,
                          }),
                });
            }
        });
    }

    async logOff() {
        if (!this.loggedIn) {
            return;
        }

        if (this.account.launched) {
            this.steamUser.gamesPlayed([]);
            this.account.launched = false;
            await this.account.save();
        }

        this.active();

        await new Promise<void>((r) => {
            const timeout = setTimeout(r, 3000);

            this.steamUser.logOff();

            this.steamUser.once('disconnected', () => {
                clearTimeout(timeout);
                r();
            });
        });

        this.tellOff();
    }

    async runBoost() {
        if (this.activeAppId > 0) {
            return false;
        }

        this.updateGamesPlayed();

        if (!this.account.launched) {
            this.account.launched = true;
            await this.account.save();
        }

        this.tellClients('account_state', {
            launched: true,
            id: this.account.id,
            loggedIn: this.loggedIn,
        });

        return true;
    }

    async stopBoost() {
        this.active();
        this.steamUser.gamesPlayed([]);

        if (this.account.launched) {
            this.account.launched = false;
            await this.account.save();
        }

        this.tellClients('account_state', {
            launched: false,
            id: this.account.id,
            loggedIn: this.loggedIn,
        });
    }

    private async updateAccount(event: SteamUserEvent) {
        const index = this.awaitedEvents.indexOf(event);

        if (~index) {
            this.awaitedEvents.splice(index, 1);
        }

        if (this.awaitedEvents.length > 0) {
            return;
        }

        this.active();

        if (this.loggedIn) {
            try {
                const equippedItems = await this.getEquippedProfileItems();

                if (equippedItems) {
                    const checks: SteamUserProfileItemCheckObj = {
                        bg: 'profile_background',
                        frame: 'avatar_frame',
                        miniBg: 'mini_profile_background',
                    };

                    for (const [k, v] of Object.entries(checks)) {
                        if (equippedItems[v]) {
                            const item = equippedItems[v];

                            if (item) {
                                this.account.info[k] = pick(
                                    item,
                                    ...steamImageFields,
                                );
                            }
                        }
                    }
                }

                const avatar = await SteamBot.steamApi.request(
                    'user_summaries',
                    [this.steamID],
                );

                if (avatar instanceof Error) {
                    throw avatar;
                }

                this.account.info.avatar =
                    avatar.response.players[0].avatarfull;
            } catch (err) {
                this.log('unable to get complete account details');
                console.error(err);
            }
        }

        this.account._info = this.account._info
            ? this.account._info + '1'
            : '1';

        await this.account.save();

        this.tellClients(
            'account_state',
            pick(this.account, 'id', 'info', 'title', 'steamID'),
        );
    }

    getEquippedProfileItems(): Promise<SteamUserEquippedItems | null> {
        return new Promise((r) => {
            this.steamUser.getEquippedProfileItems(
                this.steamID,
                undefined,
                (err, items) => {
                    if (err !== null) {
                        this.log(
                            chalk.redBright(
                                `An error occurred while trying to obtain equipped profile items`,
                            ),
                        );
                        r(null);
                    } else {
                        //@types/node-steam-user bug
                        r(items as any);
                    }
                },
            );
        });
    }

    async updateGamesPlayed(reset = false) {
        if (reset) {
            this.steamUser.gamesPlayed([]);
            await sleep(500);
        }

        const apps = [...this.account.appIds];
        let mainApp = apps[0];

        const index = apps.indexOf(this.account.title.mainApp);

        if (index > 0) {
            mainApp = apps[index];
            apps.splice(index, 1);
            apps.splice(0, 0, mainApp);
        }

        switch (this.account.title.type) {
            case 'default':
                this.steamUser.gamesPlayed([
                    this.account.title.title,
                    ...apps.map((game_id) => ({
                        game_id,
                        game_extra_info: this.account.title.title,
                    })),
                ]);
                break;
            case 'none':
                this.steamUser.gamesPlayed(apps);
                break;
            case 'rich':
                this.steamUser.gamesPlayed(apps);
                this.steamUser.uploadRichPresence(mainApp, {
                    steam_display: this.account.title.title,
                    ...this.account.title.placeholders,
                });
                break;
        }

        clearTimeout(this.reset);
        this.reset = setTimeout(() => {
            this.updateGamesPlayed(true);
        }, 60 * 30 * 1000);
    }

    async getAppRichPresence(
        appid: number,
    ): Promise<Error | Record<string, string>> {
        return new Promise((r) => {
            this.steamUser.getAppRichPresenceLocalization(
                appid,
                undefined,
                (err, response) => {
                    r(err !== null ? err : response.tokens || null);
                },
            );
        });
    }

    tellClients: SSEDataEmitterHandler = async (type, data) => {
        const repo = getCustomRepository(AccountRepository);
        SteamBot.sse.tellClients(
            type,
            data,
            await repo.getAllUsers(this.account.id),
        );
    };

    async tellOff(err?: string) {
        const errObj: StringMap<string> = {};

        if (err) {
            errObj.err = err;
        }

        await this.tellClients('account_state', {
            id: this.account.id,
            activeAppId: 0,
            launched: false,
            loggedIn: false,
            ...errObj,
        });
    }

    log(message: string, ...text: any[]) {
        console.log(
            `${chalk.gray(new Date().toLocaleString())} - [${chalk.blueBright(
                this.account.username,
            )}]: ${message}`,
            ...text,
        );
    }

    active() {
        this.lastActivity = Date.now();
    }
}
