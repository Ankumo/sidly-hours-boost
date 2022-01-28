import { ApiBaseURL } from '@/lib/constants';
import { deleteCookie } from '@/lib/util';
import { StringMap } from '@shared/types';
import { App, State } from 'vue';
import { Store } from 'vuex';
import { ESSEState } from '../lib/enums';
import {
    SseHandler,
    EventTypes,
    Account,
    AlertsPlugin,
    AccountMutation,
} from '../lib/types';
import { i18nG } from './i18n';

class Sse {
    private alert: AlertsPlugin;
    private store: Store<State>;

    constructor(app: App) {
        this.alert = app.config.globalProperties.$alert;
        this.store = app.config.globalProperties.$store;
    }

    private es: EventSource | null = null;

    private get esPath() {
        return `${ApiBaseURL}/events`;
    }

    private get state() {
        return this.store.state.sse;
    }

    private set state(value: ESSEState) {
        this.store.commit('setSseState', value);
    }

    close() {
        if (this.es !== null && this.es.readyState !== EventSource.CLOSED) {
            this.es.close();
            this.es = null;
            this.state = ESSEState.CLOSED;
        }
    }

    async connect() {
        this.close();

        this.state = ESSEState.LOADING;
        this.es = new EventSource(this.esPath, {
            withCredentials: true,
        });

        this.es.onopen = () => {
            this.initHandlers();
        };

        this.es.onerror = () => {
            this.state = ESSEState.ERROR;
            this.es?.close();
        };

        this.es.onmessage = (e) => {
            console.log('message', e);
        };
    }

    on<T extends keyof EventTypes>(event: T, handler: SseHandler<T>) {
        if (this.es === null) {
            return;
        }

        this.es.addEventListener(event, (e) => {
            let { data } = e as MessageEvent<any>;

            try {
                data = JSON.parse(data);
            } finally {
                handler(data);
            }
        });
    }

    off<T extends keyof EventTypes>(
        event: T,
        handler: EventListenerOrEventListenerObject,
    ) {
        if (this.es === null) {
            return;
        }

        this.es.removeEventListener(event, handler);
    }

    initHandlers() {
        this.on('init', async (data) => {
            try {
                const accounts: StringMap<Account[]> = {};

                data.accounts.forEach((acc) => {
                    if (!accounts[acc.owner.username]) {
                        accounts[acc.owner.username] = [];
                    }

                    accounts[acc.owner.username].push(acc);
                });

                this.store.dispatch('init', {
                    ...data,
                    accounts,
                });

                if (i18nG.locale !== data.user.lang) {
                    window.localStorage.setItem('lastLocale', data.user.lang);
                    i18nG.locale = data.user.lang;
                }
            } catch (err) {
                console.log(`Unable to init data from SSE`, err);
            }
        });

        this.on('user_deleted', ({ username }) => {
            if (
                this.store.state.user &&
                this.store.state.user.username === username
            ) {
                deleteCookie('session_hash');
                location.href = '/';
                return;
            }

            if (this.store.state.accounts[username]) {
                this.alert.warn(['shareUserDeleted', [username]]);
            }

            this.store.commit('deleteUser', username);
        });

        this.on('account_state', (account) => {
            this.store.commit('mutateAccount', {
                id: account.id,
                action: (acc) => {
                    Object.assign(acc, account);
                },
            } as AccountMutation);
        });

        this.on('account_add', (account) => {
            this.store.commit('addAccount', account);
        });

        this.on('account_deleted', ({ id }) => {
            this.store.commit('deleteAccount', {
                id,
                withDeleted: (acc: Account) => {
                    if (acc.ownerId === this.store.state.user.id) {
                        this.alert.info(['accountDeleted', [acc.username]]);
                    } else {
                        this.alert.warn([
                            'sharedAccountDeleted',
                            [acc.username],
                        ]);
                    }
                },
            });
        });

        this.on('shared', (account) => {
            this.store.commit('addAccount', account);

            this.alert.info([
                'accountShared',
                [account.owner.username, account.username],
            ]);
        });

        this.on('unshared', ({ id }) => {
            this.store.commit('deleteAccount', {
                id,
                withDeleted: (acc: Account, u: string) => {
                    this.alert.warn(['accountUnshared', [acc.username, u]]);
                },
            });
        });

        this.on('update_cache', ({ apps }) => {
            this.store.commit('mergeAppsCache', apps);
        });

        this.on('account_shared', ({ id, user }) => {
            this.store.commit('mutateAccount', {
                id,
                action: (acc) => {
                    if (!Array.isArray(acc.sharedWith)) {
                        acc.sharedWith = [];
                        return;
                    }

                    acc.sharedWith.push(user);
                },
            } as AccountMutation);
        });

        this.on('account_unshared', ({ id, userId }) => {
            this.store.commit('mutateAccount', {
                id,
                action: (acc) => {
                    if (Array.isArray(acc.sharedWith)) {
                        const index = acc.sharedWith.findIndex(
                            (u) => u.id === userId,
                        );

                        if (~index) {
                            acc.sharedWith.splice(index, 1);
                        }
                    }
                },
            } as AccountMutation);
        });
    }
}

export default {
    install(app: App) {
        const sse = new Sse(app);
        app.config.globalProperties.$sse = sse;

        sse.connect();
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $sse: Sse;
    }
}
