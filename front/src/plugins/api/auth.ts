import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class AuthController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('auth', app, axios);
    }

    login(username: string, password: string) {
        return this.req<{
            hash: string;
            expires: string;
        }>('/login', 'post', {
            username,
            password,
        });
    }
}
