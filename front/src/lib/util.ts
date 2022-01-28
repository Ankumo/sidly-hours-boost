import { MessageSchema } from '@/plugins/i18n';
import { DeepPartial, StringMap } from '@shared/types';
import { AxiosStatic } from 'axios';
import { RouteLocationNormalized } from 'vue-router';
import { ApiBaseURL } from './constants';
import { EAccountStatus } from './enums';
import { Account, TranslationSet, TranslationSetNormalized } from './types';

export const genId = () => {
    const alph =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let result = '';

    for (let i = 0; i < 10; i++) {
        result += alph[Math.floor(Math.random() * alph.length)];
    }

    return result;
};

export const resolveTSet = <T extends keyof MessageSchema>(
    subKey: T,
    set: TranslationSet<T>,
): TranslationSetNormalized => {
    if (!Array.isArray(set)) {
        return [`${subKey}.${set}`, []];
    }

    return [`${subKey}.${set[0]}`, set[1]];
};

export const transformCode = (value: string): string => {
    if (!value) {
        return '';
    }

    value = value.toLowerCase();

    const cyreplace: StringMap<string> = {
        й: 'q',
        ц: 'w',
        у: 'e',
        к: 'r',
        е: 't',
        н: 'y',
        г: 'u',
        ш: 'i',
        щ: 'o',
        з: 'p',
        ф: 'a',
        ы: 's',
        в: 'd',
        а: 'f',
        п: 'g',
        р: 'h',
        о: 'j',
        л: 'k',
        д: 'l',
        я: 'z',
        ч: 'x',
        с: 'c',
        м: 'v',
        и: 'b',
        т: 'n',
        ь: 'm',
    };

    let newValue = '';

    for (let i = 0; i < value.length; i++) {
        const c = value[i];

        if (/[a-z0-9]/.test(c)) {
            newValue += c;
        } else if (cyreplace[c]) {
            newValue += cyreplace[c];
        }
    }

    return newValue.toUpperCase();
};

export const Route404 = (
    from: RouteLocationNormalized,
): RouteLocationNormalized =>
    ({
        name: 'NotFound',
        query: from.query,
        hash: from.hash,
        params: {
            pathMatch: from.path.split('/').slice(1),
        },
    } as any);

export const Route500 = (
    from: RouteLocationNormalized,
): RouteLocationNormalized =>
    ({
        name: 'InternalServerError',
        query: from.query,
        hash: from.hash,
        params: {
            pathMatch: from.path.split('/').slice(1),
        },
    } as any);

export const getAccountStatus = (acc: DeepPartial<Account>): EAccountStatus => {
    let result: EAccountStatus = EAccountStatus.Offline;

    if (acc.activeAppId) {
        result = EAccountStatus.InGame;
    } else if (acc.launched) {
        result = EAccountStatus.Boosting;
    } else if (acc.loggedIn) {
        result = EAccountStatus.Online;
    }

    return result;
};

export const configureAxios = (axios: AxiosStatic) => {
    axios.defaults.baseURL = ApiBaseURL;
    axios.defaults.withCredentials = true;
    axios.defaults.timeout = 10000;
};

export const setCookie = (
    name: string,
    value: string,
    options?: StringMap<any>,
) => {
    options = options || {};

    let expires = options.expires;

    if (typeof expires === 'number' && expires) {
        const d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }

    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + '=' + value;

    for (const propName in options) {
        updatedCookie += '; ' + propName;
        const propValue = options[propName];

        if (propValue !== true) {
            updatedCookie += '=' + propValue;
        }
    }

    document.cookie = updatedCookie;
};

export const getCookie = (name: string) => {
    const matches = document.cookie.match(
        new RegExp(
            '(?:^|; )' +
                name.replace(/([.$?*|{}()[]\/+^])/g, '\\$1') +
                '=([^;]*)',
        ),
    );

    return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const deleteCookie = (name: string) =>
    setCookie(name, '', {
        expires: -1,
    });
