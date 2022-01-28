import { ApiErr } from '@shared/types';
import { AppConfig } from 'src/utils/config';

export type LimitCounter = {
    key: keyof AppConfig;
    calc: () => Promise<number> | number;
    result: ApiErr;
};
