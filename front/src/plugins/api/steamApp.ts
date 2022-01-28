import { SteamApp } from '@/lib/types';
import { SteamAppLocale } from '@shared/types';
import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class SteamAppController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('steam-app', app, axios);
    }

    search(text: string) {
        return this.req<SteamApp[]>(`/search/${text}`);
    }

    searchOwned(text: string, accountId: number) {
        return this.req<SteamApp[] | Error>(
            `/search/${text}/account/${accountId}`,
        );
    }

    locale(appid: number) {
        return this.req<Error | SteamAppLocale | null>(`/locale/${appid}`);
    }

    byIds(ids: number[]) {
        return this.req<SteamApp[]>('/by-ids', 'post', { ids });
    }
}
