import { configureAxios } from '@/lib/util';
import { AuthController } from '@/plugins/api/auth';
import axios from 'axios';
import { App } from 'vue';

export default {
    install(app: App) {
        configureAxios(axios);

        app.config.globalProperties.$api = new AuthController(app, axios);
    },
};

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $api: AuthController;
    }
}
