import {
    AlertsPlugin,
    AlertType,
    IAlertStore,
    TranslationSet,
} from '@/lib/types';
import { genId } from '@/lib/util';
import { App } from 'vue';
import { Store } from 'vuex';

export default {
    install(app: App) {
        const store: Store<IAlertStore> = app.config.globalProperties.$store;

        const show = (
            type: AlertType,
            text: TranslationSet<'alert'>,
            error: any = '',
        ) => {
            store.commit('addAlert', {
                id: genId(),
                type,
                text,
                error,
            });
        };

        app.config.globalProperties.$alert = {
            err: (text, error) => show('error', text, error),
            show: (text, error) => show('default', text, error),
            success: (text, error) => show('success', text, error),
            warn: (text, error) => show('warning', text, error),
            info: (text, error) => show('info', text, error),
        } as AlertsPlugin;
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $alert: AlertsPlugin;
    }
}
