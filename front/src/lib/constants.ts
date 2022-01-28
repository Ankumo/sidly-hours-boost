import { ApiMethods } from './types';

export const ApiNoBodyMethods: ApiMethods[] = [
    'get',
    'delete',
    'options',
    'head',
];

export const ApiBaseURL = `${process.env.VUE_APP_PROTOCOL}://${
    location.hostname
}${process.env.VUE_APP_PORT ? `:${process.env.VUE_APP_PORT}` : ''}/api`;
