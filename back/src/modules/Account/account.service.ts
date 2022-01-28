import {
    forwardRef,
    Inject,
    Injectable,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { AccountRepository } from './account.repository';
import { SteamBot } from 'src/utils/bot';
import { AppRequest } from 'src/defaults/types';
import {
    AddAccountDTO,
    PersonaStateDTO,
    GamesDTO,
    ProceedAccountDTO,
    SetTitleDTO,
    ShareDTO,
} from './account.dto';
import { Res } from 'src/utils/res';
import { Account } from './entities/account.entity';
import { EventsService } from '../Events/events.service';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../User/user.repository';
import { pick } from 'src/utils';
import { User } from '../User/entities/user.entity';
import { ApiErr, StringMap } from '@shared/types';
import config from 'src/utils/config';
import { CronJob } from 'cron';
import { CronExpression } from '@nestjs/schedule';
import { SteamAppRepository } from '../SteamApp/steam-app.repository';
import { EResult } from 'steam-user';
import { LimitCounter } from './account.types';

@Injectable()
export class AccountService implements OnApplicationBootstrap {
    public bots: StringMap<SteamBot> = {};

    constructor(
        private repo: AccountRepository,
        @Inject(forwardRef(() => EventsService))
        private sse: EventsService,
    ) {
        if (config.kickTimeout && config.kickTimeout >= 60 * 5) {
            const job = new CronJob(CronExpression.EVERY_5_MINUTES, () => {
                this.checkInactiveAccounts();
            });

            job.start();
        }
    }

    checkInactiveAccounts() {
        if (!this.bots) {
            return;
        }

        Object.values(this.bots).forEach(async (bot) => {
            if (
                !bot.launched &&
                config.kickTimeout < (Date.now() - bot.lastActivity) / 1000
            ) {
                await bot.logOff();
                delete this.bots[bot.username];
            }
        });
    }

    async getBot(
        username: string,
        createIfNotFound = true,
    ): Promise<SteamBot | null> {
        if (this.bots[username]) {
            return this.bots[username];
        }

        if (!createIfNotFound) {
            return null;
        }

        const account = await this.repo
            .botAccountQuery()
            .where('a.username = :username', { username })
            .getOne();

        if (!account) {
            return null;
        }

        const newBot = new SteamBot(account);
        this.bots[username] = newBot;

        return newBot;
    }

    getAnyOnlineBot() {
        for (const bot of Object.values(this.bots)) {
            if (bot.loggedIn) {
                return bot;
            }
        }

        return null;
    }

    getActiveBotsCount(ownerId?: number): number {
        if (ownerId) {
            return Object.values(this.bots).reduce(
                (sum, bot) =>
                    sum +
                    (bot.launched && bot.account.ownerId === ownerId ? 1 : 0),
                0,
            );
        } else {
            return Object.values(this.bots).reduce(
                (sum, bot) => sum + (bot.launched ? 1 : 0),
                0,
            );
        }
    }

    getBotAccount(
        username: string,
        select: (keyof Account)[] = ['id', 'username'],
    ) {
        if (this.bots[username]) {
            return this.bots[username].account;
        }

        return this.repo.findOne({
            select,
            where: {
                username,
            },
        });
    }

    async destroyBot(username: string) {
        const bot = this.bots[username];

        if (bot) {
            if (bot.loggedIn) {
                await bot.logOff();
            }

            this.bots[username] = null;
            delete this.bots[username];
        }
    }

    async destroyUserBots(id: number) {
        const bots = Object.values(this.bots).filter(
            (b) => b.account.ownerId === id,
        );

        if (bots.length === 0) {
            return;
        }

        await Promise.all(
            bots.map(async (b) => {
                if (b.loggedIn) {
                    await b.logOff();
                }

                this.bots[b.username] = null;
                delete this.bots[b.username];
            }),
        );
    }

    async getAccessiveAccount(
        id: number,
        req: AppRequest,
        select: (keyof Account)[] = ['id', 'username'],
    ) {
        const account = await this.repo.findOne({
            where: {
                id,
            },
            select: [...select, 'ownerId'],
            loadRelationIds: {
                relations: ['sharedWith'],
            },
        });

        if (
            !account ||
            (account.ownerId !== req.user.id &&
                !account.sharedWith.includes(req.user.id as any))
        ) {
            return null;
        }

        delete account.sharedWith;

        return account;
    }

    async checkLimits(checks: Array<LimitCounter>): Promise<ApiErr | null> {
        for (const c of checks) {
            if (config[c.key]) {
                const count = await c.calc();

                if (count >= config[c.key]) {
                    return c.result;
                }
            }
        }

        return null;
    }

    async add({ username, password, isKnown }: AddAccountDTO, req: AppRequest) {
        let account = await this.getBotAccount(username, [
            'id',
            'username',
            'ownerId',
            'steamID',
            '_appIds',
            '_info',
            '_title',
        ]);

        if (!account) {
            if (isKnown) {
                return new Res(false, ApiErr.AccountNotFound);
            }

            account = this.repo.create({
                username,
                owner: {
                    id: req.user.id,
                },
                _appIds: '',
                _title: '',
                _info: '',
            });
            account.afterLoad();
        } else if (account.ownerId !== req.user.id) {
            return new Res(false, ApiErr.AccountNotYours);
        } else if (!isKnown) {
            return new Res(false, ApiErr.AccountAlreadyExists);
        }

        if (!req.user.isRoot) {
            const err = await this.checkLimits([
                {
                    calc: () => this.repo.getAccountsCount(req.user.id),
                    key: 'maxBotsPerUser',
                    result: ApiErr.TooMuchAccounts,
                },
                {
                    calc: () => this.getActiveBotsCount(req.user.id),
                    key: 'maxActiveBotsPerUser',
                    result: ApiErr.TooMuchYourActiveAccounts,
                },
                {
                    calc: () => this.getActiveBotsCount(),
                    key: 'maxActiveBotsOnServer',
                    result: ApiErr.TooMuchActiveAccounts,
                },
            ]);

            if (err) {
                return new Res(false, err);
            }
        }

        account.password = password;
        account.sharedWith = [];

        const newBot = new SteamBot(account);

        const [logOnResult, error] = await newBot.logOn();

        if (logOnResult === 'error') {
            return new Res(false, ApiErr.BotLogonError, {
                logOnResult,
                error,
            });
        }

        await account.save();

        this.bots[username] = newBot;

        delete account.password;
        delete account.loginKey;

        if (logOnResult === 'success') {
            account.loggedIn = true;
        }

        this.sse.tellClients(
            'account_add',
            account,
            await this.repo.getAllUsers(account.id),
        );

        return new Res(true, {
            logOnResult,
            accountId: account.id,
        });
    }

    async proceed({ id, code, runBoost }: ProceedAccountDTO, req: AppRequest) {
        const account = await this.repo.findOne({
            select: ['id', 'username', 'ownerId'],
            where: {
                id,
            },
        });

        if (!account || account.ownerId !== req.user.id) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        if (!req.user.isRoot) {
            const err = await this.checkLimits([
                {
                    calc: () => this.getActiveBotsCount(req.user.id),
                    key: 'maxActiveBotsPerUser',
                    result: ApiErr.TooMuchYourActiveAccounts,
                },
                {
                    calc: () => this.getActiveBotsCount(),
                    key: 'maxActiveBotsOnServer',
                    result: ApiErr.TooMuchActiveAccounts,
                },
            ]);

            if (err) {
                return new Res(false, err);
            }
        }

        const bot = await this.getBot(account.username);
        const [logOnResult, error] = await bot.logOn(code);

        if (logOnResult === 'error') {
            return new Res(false, ApiErr.BotLogonError, {
                logOnResult,
                error,
            });
        }

        if (bot.loggedIn && runBoost) {
            const launchResult = await bot.runBoost();
            this.sse.tellClients(
                'account_state',
                {
                    id: bot.account.id,
                    launched: launchResult,
                    loggedIn: true,
                },
                await this.repo.getAllUsers(bot.account.id),
            );
        }

        return new Res(true, {
            logOnResult,
        });
    }

    async delete(id: number, req: AppRequest) {
        const account = await this.repo
            .createQueryBuilder('a')
            .leftJoin('a.sharedWith', 'u')
            .select(['a.id', 'a.username', 'a.ownerId', 'u.id'])
            .where('a.id = :id', { id })
            .getOne();

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        let accountUsers: number[] = [];
        await this.destroyBot(account.username);

        if (account.ownerId === req.user.id) {
            accountUsers = await this.repo.getAllUsers(id);

            await account.remove();
        } else {
            accountUsers.push(req.user.id);

            const index = account.sharedWith.findIndex(
                (u) => u.id === req.user.id,
            );

            if (~index) {
                account.sharedWith.splice(index, 1);
            }

            await account.save();

            this.sse.tellClients(
                'account_unshared',
                {
                    userId: req.user.id,
                    id: account.id,
                },
                [account.ownerId],
            );
        }

        this.sse.tellClients('account_deleted', { id }, accountUsers);

        return new Res();
    }

    async runBoost(id: number, req: AppRequest) {
        const account = await this.getAccessiveAccount(id, req, [
            'id',
            'username',
            '_appIds',
        ]);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        if (account.appIds.length === 0) {
            return new Res(false, ApiErr.NoAppIds);
        }

        if (!req.user.isRoot) {
            const err = await this.checkLimits([
                {
                    calc: () => this.getActiveBotsCount(req.user.id),
                    key: 'maxActiveBotsPerUser',
                    result: ApiErr.TooMuchYourActiveAccounts,
                },
                {
                    calc: () => this.getActiveBotsCount(),
                    key: 'maxActiveBotsOnServer',
                    result: ApiErr.TooMuchActiveAccounts,
                },
            ]);

            if (err) {
                return new Res(false, err);
            }
        }

        const bot = await this.getBot(account.username);

        if (!bot.loggedIn) {
            const [logOnResult, error] = await bot.logOn();

            if (logOnResult === 'error') {
                return new Res(false, ApiErr.BotLogonError, {
                    logOnResult,
                    error,
                });
            }

            if (logOnResult !== 'success') {
                return new Res(false, ApiErr.BotNeedRelogon, {
                    logOnResult,
                });
            }
        }

        if (bot.activeAppId) {
            this.sse.tellClients(
                'account_state',
                {
                    id,
                    activeAppId: bot.activeAppId,
                },
                await this.repo.getAllUsers(id),
            );
            return new Res(false, ApiErr.BotBlocked);
        }

        return (await bot.runBoost())
            ? new Res()
            : new Res(false, ApiErr.Unexpected);
    }

    async stopBoost(id: number, req: AppRequest) {
        const account = await this.getAccessiveAccount(id, req, [
            'id',
            'username',
            'launched',
        ]);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const bot = await this.getBot(account.username, false);

        if (bot && bot.loggedIn) {
            await bot.stopBoost();
        } else if (account.launched) {
            account.launched = false;
            await account.save();

            this.sse.tellClients(
                'account_state',
                {
                    launched: false,
                    id: account.id,
                    loggedIn: false,
                    activeAppId: 0,
                },
                await this.repo.getAllUsers(account.id),
            );
        }

        return new Res();
    }

    async logOn(id: number, req: AppRequest) {
        const account = await this.getAccessiveAccount(id, req);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        if (!req.user.isRoot) {
            const err = await this.checkLimits([
                {
                    calc: () => this.getActiveBotsCount(req.user.id),
                    key: 'maxActiveBotsPerUser',
                    result: ApiErr.TooMuchYourActiveAccounts,
                },
                {
                    calc: () => this.getActiveBotsCount(),
                    key: 'maxActiveBotsOnServer',
                    result: ApiErr.TooMuchActiveAccounts,
                },
            ]);

            if (err) {
                return new Res(false, err);
            }
        }

        const bot = await this.getBot(account.username);

        if (!bot.loggedIn) {
            const [logOnResult, error] = await bot.logOn();

            if (logOnResult === 'error') {
                return new Res(false, ApiErr.BotLogonError, {
                    logOnResult,
                    error,
                });
            }

            if (logOnResult !== 'success') {
                return new Res(false, ApiErr.BotNeedRelogon, {
                    logOnResult,
                });
            }
        } else {
            this.sse.tellClients(
                'account_state',
                {
                    id: account.id,
                    launched: account.launched || false,
                    loggedIn: true,
                },
                await this.repo.getAllUsers(account.id),
            );
        }

        return new Res();
    }

    async logOff(id: number, req: AppRequest) {
        const account = await this.getAccessiveAccount(id, req, [
            'id',
            'username',
            'launched',
        ]);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const bot = await this.getBot(account.username, false);

        if (bot && bot.loggedIn) {
            await bot.logOff();
        } else {
            if (account.launched) {
                account.launched = false;
                await account.save();
            }

            this.sse.tellClients(
                'account_state',
                {
                    launched: false,
                    id: account.id,
                    loggedIn: false,
                    activeAppId: 0,
                },
                await this.repo.getAllUsers(account.id),
            );
        }

        delete this.bots[account.username];

        return new Res();
    }

    async personaState({ id, state }: PersonaStateDTO, req: AppRequest) {
        const account = await this.getAccessiveAccount(id, req);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const bot = await this.getBot(account.username, false);

        if (bot) {
            bot.personaState = state;
            bot.active();
        }

        account.personaState = state;
        await account.save();

        this.sse.tellClients(
            'account_state',
            pick(account, 'id', 'personaState'),
            await this.repo.getAllUsers(account.id),
        );

        return new Res();
    }

    async gamesPlayed(dto: GamesDTO, req: AppRequest) {
        let account = await this.getAccessiveAccount(dto.id, req, [
            'id',
            'username',
            '_appIds',
            '_title',
        ]);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const bot = await this.getBot(account.username, false);

        if (bot) {
            account = bot.account;
        }

        let mainAppChanged = false;

        if (dto.type) {
            const appid = dto.appIds[0];

            if (account.appIds.includes(appid)) {
                return new Res(false, ApiErr.AppAlreadyExists);
            }

            if (
                config.maxAppsPerAccount &&
                account.appIds.length >= config.maxAppsPerAccount
            ) {
                return new Res(false, ApiErr.TooMuchApps);
            }

            account.appIds.push(appid);

            if (
                account.appIds.length === 1 &&
                appid !== account.title.mainApp
            ) {
                mainAppChanged = true;
                account.title.mainApp = appid;
            }

            const appRepo = getCustomRepository(SteamAppRepository);

            const app = await appRepo.findOne(appid);

            if (app) {
                this.sse.tellClients(
                    'update_cache',
                    {
                        apps: [app],
                    },
                    await this.repo.getAllUsers(account.id),
                );
            }
        } else {
            account.appIds = account.appIds.filter(
                (app) => !dto.appIds.includes(app),
            );

            if (!account.appIds.includes(account.title.mainApp)) {
                mainAppChanged = true;
                account.title.mainApp = 0;
            }
        }

        account._appIds = '';

        const fields: Array<keyof Account> = ['id', 'appIds'];

        if (mainAppChanged) {
            fields.push('title');
            account._title = '';
        }

        await account.save();

        this.sse.tellClients(
            'account_state',
            pick(account, ...fields),
            await this.repo.getAllUsers(account.id),
        );

        if (bot) {
            bot.active();

            if (bot.launched) {
                if (account.appIds.length > 0) {
                    bot.updateGamesPlayed(true);
                } else {
                    bot.stopBoost();
                }
            }
        }

        return new Res();
    }

    async setTitle(dto: SetTitleDTO, req: AppRequest) {
        let account = await this.getAccessiveAccount(dto.id, req, [
            'id',
            'username',
            '_title',
        ]);

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const bot = await this.getBot(account.username, false);

        if (bot) {
            account = bot.account;
        }

        account.title = dto.title;
        account._title = '';

        await account.save();

        if (bot && bot.loggedIn) {
            bot.active();

            if (bot.launched) {
                bot.updateGamesPlayed(true);
            }
        }

        this.sse.tellClients(
            'account_state',
            pick(account, 'id', 'title'),
            await this.repo.getAllUsers(account.id),
        );

        return new Res();
    }

    async toggleShare(dto: ShareDTO, req: AppRequest) {
        const account = await this.repo
            .createQueryBuilder('a')
            .leftJoin('a.sharedWith', 'u')
            .select(['a.id', 'a.username', 'u.id', 'u.username'])
            .where('a.id = :id', dto)
            .andWhere('a.ownerId = :owner', {
                owner: req.user.id,
            })
            .getOne();

        if (!account) {
            return new Res(false, ApiErr.AccountNotFound);
        }

        const uRepo = getCustomRepository(UserRepository);
        const user = await uRepo.findOne({
            where: {
                username: dto.username,
            },
            select: ['id', 'username'],
        });

        if (!user) {
            return new Res(false, ApiErr.UsernameNotFound);
        }

        const index = account.sharedWith.findIndex((u) => u.id === user.id);

        if (~index) {
            account.sharedWith.splice(index, 1);
            this.sse.tellClients('unshared', { id: account.id }, [user.id]);
            this.sse.tellClients(
                'account_unshared',
                {
                    id: account.id,
                    userId: user.id,
                },
                [req.user.id],
            );
        } else {
            account.sharedWith.push(user);

            const fullAccount = await this.getBotAccount(account.username, [
                '_appIds',
                '_info',
                '_title',
                'id',
                'personaState',
                'steamID',
                'username',
                'launched',
                'lastError',
            ]);

            fullAccount.owner = pick(req.user, 'id', 'username') as User;

            this.sse.tellClients('shared', fullAccount, [user.id]);
            this.sse.tellClients(
                'account_shared',
                {
                    id: account.id,
                    user,
                },
                [req.user.id],
            );
        }

        await account.save();

        return new Res();
    }

    async getMyAccounts(req: AppRequest) {
        const userRepo = getCustomRepository(UserRepository);
        const richUser = await userRepo
            .createQueryBuilder('u')
            .select('')
            .leftJoinAndSelect('u.accounts', 'acc')
            .leftJoinAndSelect('u.sharedAccounts', 'shared')
            .leftJoin('acc.sharedWith', 'accShared')
            .leftJoin('shared.owner', 'sharedOwner')
            .addSelect([
                'sharedOwner.username',
                'sharedOwner.id',
                'accShared.id',
                'accShared.username',
            ])
            .where('u.id = :id', { id: req.user.id })
            .getOne();

        const accounts = [...richUser.accounts, ...richUser.sharedAccounts];
        const thisUser = pick(req.user, 'username', 'id') as User;

        accounts.forEach((acc) => {
            delete acc._appIds;
            delete acc._info;
            delete acc._title;
            delete acc.loginKey;

            if (acc.ownerId === req.user.id) {
                acc.owner = thisUser;
            }

            const bot = this.bots[acc.username];

            if (bot) {
                acc.loggedIn = bot.loggedIn;
                acc.activeAppId = bot.activeAppId;
            }
        });

        return accounts;
    }

    onApplicationBootstrap() {
        if (!config.runBotsAtStartup) {
            return;
        }

        new Promise<void>(async (r) => {
            const accs = await this.repo
                .createQueryBuilder('a')
                .select(['a.username', 'a.id'])
                .where('a.launched = :launched', { launched: true })
                .getMany();

            let count = 0;
            let limited = false;

            for (const { username, id } of accs) {
                const acc = await this.getBot(username);

                const [result, err] = await acc.logOn();
                let destroy = false;

                if (result === 'success') {
                    const launched = await acc.runBoost();

                    if (launched) {
                        count++;
                    } else {
                        destroy = true;
                    }
                } else {
                    let lastError: keyof typeof EResult;

                    if (err.eresult && EResult[err.eresult]) {
                        lastError = EResult[err.eresult] as any;
                    }

                    await this.repo.save({
                        id,
                        lastError,
                        launched: false,
                    });

                    destroy = true;
                }

                if (destroy) {
                    await this.destroyBot(username);
                }

                if (
                    config.maxActiveBotsOnServer &&
                    count >= config.maxActiveBotsOnServer
                ) {
                    limited = true;
                    break;
                }
            }

            if (limited) {
                const ids = accs.map((acc) => acc.id);

                await this.repo
                    .createQueryBuilder()
                    .update({
                        launched: false,
                    })
                    .where('launched = :launched', { launched: true })
                    .andWhere('id NOT IN (:...ids)', { ids })
                    .execute();
            }

            r();
        });
    }
}
