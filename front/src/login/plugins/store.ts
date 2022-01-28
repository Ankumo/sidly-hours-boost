import { AlertModel, IAlertStore } from '@/lib/types';
import { createStore as storeFactory } from 'vuex';

export default storeFactory({
    state: {
        alerts: [],
    } as IAlertStore,
    mutations: {
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
    },
});
