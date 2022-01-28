import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppRequest } from 'src/defaults/types';
import { SteamBot } from 'src/utils/bot';
import config from 'src/utils/config';
import { DeepPartial, getCustomRepository } from 'typeorm';
import { AccountService } from '../Account/account.service';
import { SteamApp } from '../SteamApp/entities/steam-app.entity';
import { SteamAppRepository } from '../SteamApp/steam-app.repository';
import { SSEDataEmitter } from './events.emitter';
import { SSEDataEmitterHandler } from './events.types';

@Injectable()
export class EventsService {
    private dataEmitter: SSEDataEmitter;

    constructor(
        @Inject(forwardRef(() => AccountService))
        private accService: AccountService,
    ) {
        this.dataEmitter = new SSEDataEmitter();
        SteamBot.sse = this;
    }

    async subscribe(req: AppRequest) {
        if (!req.user) {
            console.error(
                'Trying to subscribe to SSE with no-user request ???',
            );
            return new BadRequestException();
        }

        const accounts = await this.accService.getMyAccounts(req);
        const ids: number[] = [];

        accounts.forEach((acc) => {
            const app = acc.title.mainApp || acc.appIds[0];

            if (app && !ids.includes(app)) {
                ids.push(app);
            }
        });

        let apps: Array<DeepPartial<SteamApp>> = [];

        if (ids.length > 0) {
            const appRepo = getCustomRepository(SteamAppRepository);

            apps = await appRepo.findByIds(ids, {
                select: ['appid', 'name'],
            });
        }

        return new Observable<MessageEvent<any>>((subscriber) => {
            const listener = this.dataEmitter.sub((type, data, to) => {
                if (to && !to.includes(req.user.id)) {
                    return;
                }

                subscriber.next({
                    type,
                    data,
                } as any);
            });

            subscriber.next({
                type: 'init',
                data: {
                    user: req.user,
                    accounts,
                    apps,
                },
            } as any);

            let ping: NodeJS.Timeout | null = null;

            if (config.keepAlivePing) {
                const reset = () => {
                    subscriber.next({
                        type: 'ping',
                        data: { foo: 'bar' },
                    } as any);

                    ping = setTimeout(reset, config.keepAlivePing * 1000);
                };

                ping = setTimeout(reset, config.keepAlivePing * 1000);
            }

            return () => {
                this.dataEmitter.unsub(listener);
                clearTimeout(ping);
            };
        });
    }

    tellClients: SSEDataEmitterHandler = (type, data, to) => {
        this.dataEmitter.emitData(type, data, to);
    };
}
