import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import path from 'path';
import { SteamBot } from 'src/utils/bot';
import config from 'src/utils/config';
import { URL } from 'url';
import { ENDPOINT, METHODS } from './steam-api.constants';
import { SteamApiMethods } from './steam-api.types';

@Injectable()
export class SteamApiService {
    constructor(private http: HttpService) {
        SteamBot.steamApi = this;
    }

    private buildEndPoint<T extends keyof SteamApiMethods>(
        method: T,
        data?: SteamApiMethods[T]['data'],
    ): string {
        const endPoint = new URL(path.join(ENDPOINT, METHODS[method]));
        endPoint.searchParams.set('key', config.steamApiKey);

        if (data !== undefined) {
            if (typeof data === 'object' && !Array.isArray(data)) {
                Object.keys(data).forEach((k) => {
                    endPoint.searchParams.set(k, data[k]);
                });
            } else {
                switch (method) {
                    case 'user_summaries':
                        endPoint.searchParams.set(
                            'steamids',
                            //not infered ???
                            (
                                data as SteamApiMethods['user_summaries']['data']
                            ).join(','),
                        );
                        break;
                }
            }
        }

        return endPoint.toString();
    }

    async request<T extends keyof SteamApiMethods>(
        method: T,
        data?: SteamApiMethods[T]['data'],
    ): Promise<SteamApiMethods[T]['returns'] | Error> {
        return new Promise((r) => {
            this.http.get(this.buildEndPoint(method, data)).subscribe({
                error(err) {
                    r(err);
                },
                next(value) {
                    r(value.data as any);
                },
            });
        });
    }

    /*async getAvatars(dto: StringsDTO, req: AppRequest) {
        if (
            dto.ids.length >
            req.user.accounts.length + req.user.sharedAccounts.length
        ) {
            return new Res(false, 'too_much_steamids');
        }

        const avatarMap: StringMap<string> = {};

        if (dto.ids.length > 0) {
            const limit = 90;
            const parts = Math.ceil(dto.ids.length / limit);

            for (let i = 0; i < parts; i++) {
                const start = i * limit;
                const slice = dto.ids.slice(start, start + limit);

                const response = await this.request('user_summaries', slice);

                if (response instanceof Error) {
                    console.log(
                        chalk.yellowBright(
                            `Unable to get users summaries of ${i + 1} slice`,
                            response,
                        ),
                    );
                    continue;
                }

                response.response.players.forEach((player) => {
                    avatarMap[player.steamid] = player.avatarfull;
                });
            }
        }

        return new Res(true, avatarMap);
    }*/
}
