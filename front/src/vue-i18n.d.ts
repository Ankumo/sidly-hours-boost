import { MessageSchema } from './plugins/i18n';

declare module 'vue-i18n' {
    import { DefineLocaleMessage } from 'vue-i18n';

    /* eslint-disable-next-line */
    export interface DefineLocaleMessage extends MessageSchema {}
}

export {};
