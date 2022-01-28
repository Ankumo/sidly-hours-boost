import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class SteamApiController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('steam-api', app, axios);
    }
}
