import * as crypto from 'crypto';
import { DeepPartial } from 'typeorm';

export const getMd5 = (data: string | Buffer) =>
    crypto.createHash('md5').update(data).digest('hex');

export const pick = <T>(obj: T, ...args: (keyof T)[]) => {
    const result: DeepPartial<T> = {};

    for (const k of args) {
        result[k as any] = obj[k];
    }

    return result;
};
