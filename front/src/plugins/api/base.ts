import { i18nG } from '@/plugins/i18n';
import { ApiNoBodyMethods } from '@/lib/constants';
import { AlertsPlugin, ApiMethods, ApiResult } from '@/lib/types';
import { ApiErr } from '@shared/types';
import { AxiosRequestConfig, AxiosResponse, AxiosStatic } from 'axios';
import { App } from 'vue';

export class BaseController {
    private alert: AlertsPlugin;

    constructor(private name: string, app: App, private axios: AxiosStatic) {
        this.alert = app.config.globalProperties.$alert;
    }

    async reqWithOptions<T = any>(
        path: string,
        method: ApiMethods = 'get',
        options?: AxiosRequestConfig,
        body?: any,
        filterErrors = true,
    ): Promise<ApiResult<T> | null> {
        if (ApiNoBodyMethods.includes(method) && body !== undefined) {
            options = body;
        }

        try {
            const response: AxiosResponse = await (this.axios[method] as any)(
                `/${this.name}${path}`,
                body,
                options,
            );

            if (response.status === 200 || response.status === 201) {
                const res = response.data as ApiResult;

                if (filterErrors && !res.success && res.errCode) {
                    const errPath = `apiErr.${res.errCode}`;

                    if (i18nG.te(`alert.${errPath}`)) {
                        const eResult = res.data?.error?.eresult;

                        switch (res.errCode) {
                            case ApiErr.BotLogonError:
                                if (eResult) {
                                    this.alert.err([errPath, eResult], res);
                                } else {
                                    this.alert.err(
                                        'error.logOnUnexpected',
                                        res,
                                    );
                                }
                                break;
                            default:
                                this.alert.err(errPath, res);
                                break;
                        }
                    }
                }

                if (process.env.NODE_ENV === 'development') {
                    console.log('API Request: ', {
                        path: `/${this.name}${path}`,
                        body,
                        res,
                    });
                }

                return res;
            }

            this.alert.err('error.http', response);
        } catch (err) {
            this.alert.err('error.http', err);
        }

        return null;
    }

    async req<T = any>(
        path: string,
        method: ApiMethods = 'get',
        body?: any,
        filterErrors = true,
    ) {
        return this.reqWithOptions<T>(
            path,
            method,
            undefined,
            body,
            filterErrors,
        );
    }
}
