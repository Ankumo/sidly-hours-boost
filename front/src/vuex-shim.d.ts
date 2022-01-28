import { Store } from 'vuex';

import {
    Account,
    IAlertStore,
    IModalStore,
    MainBg,
    SteamApp,
    User,
} from './lib/types';

import { ESSEState } from './lib/enums';

declare module '@vue/runtime-core' {
    import { ComponentCustomProperties } from 'vue';

    type StoreDefaults = IAlertStore & IModalStore;

    interface State extends StoreDefaults {
        sse: ESSEState;
        user: User;
        accounts: StringMap<Account[]>;
        appsCache: Record<number, SteamApp>;
        bg: null | MainBg;
    }

    interface ComponentCustomProperties {
        $store: Store<State>;
    }
}

export {};
