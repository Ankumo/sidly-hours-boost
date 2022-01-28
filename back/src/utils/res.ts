import { ApiErr } from '@shared/types';

export class Res {
    constructor(success?: boolean, data?: ApiErr | any);
    constructor(success?: boolean, errCode?: ApiErr, data?: any);
    constructor(success = true, errCode?: ApiErr, data?: any) {
        if (!success && !errCode) {
            errCode = ApiErr.Unexpected;
        }

        if (ApiErr[errCode] === undefined && !data) {
            data = errCode;
            errCode = undefined;
        }

        Object.assign(this, {
            success,
            errCode,
            data,
        });
    }
}
