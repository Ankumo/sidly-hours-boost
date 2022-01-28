import { EventTypes } from '@shared/types';
import { Account } from '../Account/entities/account.entity';
import { SteamApp } from '../SteamApp/entities/steam-app.entity';
import { User } from '../User/entities/user.entity';

export type SSEDataEmitterHandler = <
    K extends keyof EventTypes<Account, User, SteamApp>,
>(
    type: K,
    data: EventTypes<Account, User, SteamApp>[K],
    to?: number[],
) => void;
