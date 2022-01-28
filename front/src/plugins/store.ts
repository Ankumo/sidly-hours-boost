import {
    Account,
    AccountMutation,
    AlertModel,
    EventTypes,
    MainBg,
    ModalModel,
    SoftDeletePayload,
    SteamApp,
    User,
} from '@/lib/types';
import { DeepPartial, StringMap } from '@shared/types';
import { State } from '@vue/runtime-core';
import { createLogger, createStore as storeFactory, Store } from 'vuex';
import { ESSEState } from '../lib/enums';
import { App } from 'vue';
import { Api } from './api';

const createStore = (app: App): Store<State> =>
    storeFactory({
        state: {
            sse: ESSEState.CLOSED,
            user: {} as User,
            accounts: {},
            alerts: [],
            appsCache: {},
            modals: [],
            bg: null,
        } as State,
        mutations: {
            setSseState(state, payload: ESSEState) {
                state.sse = payload;
            },
            setUser(state, payload: User) {
                state.user = payload;
            },
            setAccounts(state, payload: StringMap<Account[]>) {
                state.accounts = payload;
            },
            deleteUser(state, payload: string) {
                delete state.accounts[payload];

                const accs: Account[] = state.accounts[state.user.username];

                if (accs) {
                    for (const acc of accs) {
                        if (acc.sharedWith?.length) {
                            acc.sharedWith = acc.sharedWith.filter(
                                (u) => u.username !== payload,
                            );
                        }
                    }
                }
            },
            mutateAccount(state, payload: AccountMutation) {
                if (!payload.id) {
                    return;
                }

                for (const accs of Object.values<Account[]>(state.accounts)) {
                    for (const acc of accs) {
                        if (acc.id === payload.id) {
                            payload.action(acc);
                            return;
                        }
                    }
                }
            },
            addAccount(state, payload: DeepPartial<Account>) {
                let username: string | undefined = payload.owner?.username;

                if (!username) {
                    username = state.user.username;
                }

                if (!state.accounts[username]) {
                    state.accounts[username] = [];
                }

                state.accounts[username].push(payload);
            },
            deleteAccount(state, payload: SoftDeletePayload) {
                for (const u of Object.keys(state.accounts)) {
                    const index = state.accounts[u].findIndex(
                        (acc: Account) => acc.id === payload.id,
                    );

                    if (~index) {
                        const acc: Account = state.accounts[u].splice(
                            index,
                            1,
                        )[0];

                        if (state.accounts[u].length === 0) {
                            delete state.accounts[u];
                        }

                        if (payload.withDeleted) {
                            payload.withDeleted(acc, u);
                        }
                        return;
                    }
                }
            },
            addAlert(state, payload: AlertModel) {
                state.alerts.push(payload);

                if (state.alerts.length > 3) {
                    state.alerts.splice(0, 1);
                }
            },
            closeAlert(state, payload: string) {
                const index = state.alerts.findIndex((a) => a.id === payload);

                if (~index) {
                    state.alerts.splice(index, 1);
                }
            },
            addModal(state, payload: ModalModel<any>) {
                state.modals.push(payload);
            },
            closeModal(state, payload: string) {
                const index = state.modals.findIndex((m) => m.id === payload);

                if (~index) {
                    state.modals.splice(index, 1);
                }
            },
            setBg(state, payload: MainBg | null) {
                state.bg = payload;
            },
            mergeAppsCache(state, payload: SteamApp[]) {
                const newData: Record<number, SteamApp> = {};

                payload.forEach((app) => {
                    newData[app.appid] = app;
                });

                Object.assign(state.appsCache, newData);
            },
        },
        getters: {
            getAccount:
                (state) =>
                (username: string): Account | null => {
                    for (const accs of Object.values<Account[]>(
                        state.accounts,
                    )) {
                        for (const acc of accs) {
                            if (acc.username === username) {
                                return acc;
                            }
                        }
                    }

                    return null;
                },
            getAppName:
                (state) =>
                (appId: number): string => {
                    if (!state.appsCache[appId]) {
                        return `[${appId}]`;
                    }

                    return state.appsCache[appId].name;
                },
        },
        actions: {
            init({ commit }, payload: EventTypes['init']) {
                commit('setUser', payload.user);
                commit('setAccounts', payload.accounts);

                if (payload.apps.length > 0) {
                    commit('mergeAppsCache', payload.apps);
                }

                commit('setSseState', ESSEState.CONNECTED);
            },
            async fetchApps({ commit, state }, payload: Account) {
                const ids = payload.appIds.filter(
                    (app) => !state.appsCache[app],
                );

                if (ids.length === 0) {
                    return;
                }

                const api: Api = app.config.globalProperties.$api;
                const cache = await api.steamApp.byIds(ids);

                if (cache?.success) {
                    commit('mergeAppsCache', cache.data);
                }
            },
        },
        plugins: process.env.NODE_ENV === 'development' ? [createLogger()] : [],
    });

export default {
    install(app: App) {
        app.config.globalProperties.$store = createStore(app);
    },
};
