import alert from '@/plugins/alert';
import i18n from '@/plugins/i18n';
import store from './plugins/store';
import { createApp } from 'vue';
import App from './App.vue';
import api from './plugins/api';

createApp(App).use(store).use(i18n).use(alert).use(api).mount('#app');
