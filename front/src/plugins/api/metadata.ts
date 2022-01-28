import { StatsMeta, UpdateStatsMeta } from '@/lib/types';
import { AxiosStatic } from 'axios';
import { App } from 'vue';
import { BaseController } from './base';

export class MetadataController extends BaseController {
    constructor(app: App, axios: AxiosStatic) {
        super('metadata', app, axios);
    }

    stats() {
        return this.req<StatsMeta>('/stats');
    }

    updateStats() {
        return this.req<UpdateStatsMeta>('/stats', 'patch');
    }
}
