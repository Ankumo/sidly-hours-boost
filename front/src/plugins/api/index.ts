import { configureAxios } from '@/lib/util';
import axios, { AxiosStatic } from 'axios';
import { App } from 'vue';
import { AccountController } from './account';
import { AuthController } from './auth';
import { MetadataController } from './metadata';
import { SteamApiController } from './steamApi';
import { SteamAppController } from './steamApp';
import { UserController } from './user';

export class Api {
    public steamApi: SteamApiController;
    public account: AccountController;
    public user: UserController;
    public steamApp: SteamAppController;
    public auth: AuthController;
    public meta: MetadataController;

    constructor(app: App, axios: AxiosStatic) {
        configureAxios(axios);

        this.steamApi = new SteamApiController(app, axios);
        this.account = new AccountController(app, axios);
        this.user = new UserController(app, axios);
        this.steamApp = new SteamAppController(app, axios);
        this.auth = new AuthController(app, axios);
        this.meta = new MetadataController(app, axios);
    }
}

export default {
    install(app: App) {
        app.config.globalProperties.$api = new Api(app, axios);
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: Api;
    }
}
