import { LocalesList } from '@shared/types';
import { App } from 'vue';
import { createI18n } from 'vue-i18n';
import enUS from './en';
import ruRU from './ru';

export type MessageSchema = typeof enUS;

let locale = window.localStorage.getItem('lastLocale');

if (!locale || !LocalesList.includes(locale as any)) {
    locale = 'en-US';
}

const i18n = createI18n({
    locale,
    messages: {
        'en-US': enUS,
        'ru-RU': ruRU,
    },
    fallbackLocale: 'en-US',
    legacy: true,
    pluralizationRules: {
        'ru-RU'(n) {
            n = Math.abs(n);

            return n % 100 > 4 && n % 100 < 20
                ? 2
                : [2, 0, 1, 1, 1, 2][n % 10 < 5 ? n % 10 : 5];
        },
        'en-US'(n) {
            return n === 1 ? 0 : 1;
        },
    },
});

export const i18nG = i18n.global;

export default {
    install(app: App) {
        app.config.globalProperties.$_ = i18nG.t;
        app.use(i18n);
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $_: typeof i18nG.t;
    }
}
