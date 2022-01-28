import { EPersonaState } from '@/lib/enums';
import { Account, LogOnResult } from '@/lib/types';
import { SteamBotCustomTitle } from '@shared/types';
import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class AccountController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('account', app, axios);
    }

    delete(id: number) {
        return this.req(`/id/${id}`, 'delete');
    }

    add(username: string, password: string, isKnown: boolean) {
        return this.req<
            LogOnResult & {
                accountId?: number;
            }
        >(
            '',
            'post',
            {
                username,
                password,
                isKnown,
            },
            false,
        );
    }

    proceed(id: number, code: string, runBoost = false) {
        return this.req<
            LogOnResult & {
                account?: Account;
            }
        >(
            '/proceed',
            'post',
            {
                id,
                code,
                runBoost,
            },
            false,
        );
    }

    runBoost(id: number) {
        return this.req<LogOnResult | undefined>(`/boost/${id}`, 'put');
    }

    stopBoost(id: number) {
        return this.req(`/boost/${id}`, 'delete');
    }

    logOn(id: number) {
        return this.req<LogOnResult>(`/logOn/${id}`, 'post');
    }

    logOff(id: number) {
        return this.req(`/logOff/${id}`, 'post');
    }

    personaState(id: number, state: EPersonaState) {
        return this.req('/persona-state', 'patch', {
            id,
            state,
        });
    }

    title(id: number, title: SteamBotCustomTitle) {
        return this.req('/title', 'patch', {
            id,
            title,
        });
    }

    gamesPlayed(id: number, appIds: number[], type = true) {
        return this.req('/game', 'patch', {
            id,
            appIds,
            type,
        });
    }

    toggleShare(id: number, username: string) {
        return this.req('/share', 'post', {
            id,
            username,
        });
    }
}
