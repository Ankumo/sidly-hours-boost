import { Store } from 'vuex';

import { IAlertStore } from '@/lib/types';

declare module '@vue/runtime-core' {
    import { ComponentCustomProperties } from 'vue';

    interface ComponentCustomProperties {
        $store: Store<IAlertStore>;
    }
}

export {};
