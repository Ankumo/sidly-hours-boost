import { Injectable } from '@nestjs/common';
import { MetadataRepository } from './metadata.repository';
import os from 'os';
import { getCustomRepository } from 'typeorm';
import { AccountRepository } from '../Account/account.repository';
import { Res } from 'src/utils/res';
import config from 'src/utils/config';
import { sleep } from '@shared/utils';

@Injectable()
export class MetadataService {
    constructor(private repo: MetadataRepository) {}

    async getMetadata() {
        const meta = await this.repo.findOne();

        if (meta) {
            return meta;
        }

        return this.repo.create();
    }

    getStats() {
        const cfg = config.json;

        delete cfg.steamApiKey;
        delete cfg.rootUser;

        return new Res(true, {
            type: os.type(),
            totalmem: os.totalmem(),
            uptime: os.uptime(),
            cfg,
        });
    }

    async updateStats() {
        const cpus0 = os.cpus();

        await sleep(250);

        const cpus1 = os.cpus();

        const accRepo = getCustomRepository(AccountRepository);

        const accounts = await accRepo.count();
        const launched = await accRepo.count({
            where: {
                launched: true,
            },
        });

        return new Res(true, {
            freemem: os.freemem(),
            accounts,
            launched,
            cpus1,
            cpus0,
        });
    }
}
