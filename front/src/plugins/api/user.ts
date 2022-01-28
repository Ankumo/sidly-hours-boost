import { User } from '@/lib/types';
import { Locales } from '@shared/types';
import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class UserController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('user', app, axios);
    }

    me() {
        return this.req<User>(`/me`);
    }

    byId(id: number) {
        return this.req<User | null>(`/id/${id}`);
    }

    create(username: string, password: string) {
        return this.req<User>('', 'put', {
            username,
            password,
        });
    }

    update(nickname: string, lang: Locales) {
        return this.req('', 'patch', {
            nickname,
            lang,
        });
    }

    changePassword(password: string, oldPassword: string) {
        return this.req('/change-password', 'post', {
            password,
            oldPassword,
        });
    }

    resetPassword(id: number) {
        return this.req<string>(`/id/${id}`, 'patch');
    }

    delete(id: number) {
        return this.req(`/id/${id}`, 'delete');
    }

    getAll() {
        return this.req<User[]>(`/all`);
    }
}
