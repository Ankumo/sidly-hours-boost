import { IModalStore, ModalsPlugin } from '@/lib/types';
import { genId } from '@/lib/util';
import { App } from 'vue';
import { Store } from 'vuex';

export default {
    install(app: App) {
        const store: Store<IModalStore> = app.config.globalProperties.$store;

        const show: ModalsPlugin['show'] = (component, props, header) => {
            store.commit('addModal', {
                id: genId(),
                props,
                component,
                header,
            });
        };

        app.config.globalProperties.$modal = {
            show,
            confirm(text, yes, no, plural) {
                show('Confirm', {
                    text,
                    yes: {
                        handler: yes,
                    },
                    no,
                    plural,
                });
            },
            confirmAsync(text, yes, no, plural) {
                show('Confirm', {
                    yes: {
                        handler: yes,
                        async: true,
                    },
                    no,
                    text,
                    plural,
                });
            },
            message(text, plural) {
                show('MessageBox', {
                    text,
                    plural,
                });
            },
        } as ModalsPlugin;
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $modal: ModalsPlugin;
    }
}
