import { createApp, State } from 'vue';
import App from './App.vue';
import router from './plugins/router';
import storePlugin from './plugins/store';
import i18n from './plugins/i18n';
import alert from './plugins/alert';
import sse from './plugins/sse';
import api from './plugins/api';
import modal from './plugins/modal';
import { Store } from 'vuex';

const app = createApp(App).use(storePlugin).use(i18n).use(modal).use(alert);

export const store: Store<State> = app.config.globalProperties.$store;

app.use(api).use(router).use(sse).mount('#app');
