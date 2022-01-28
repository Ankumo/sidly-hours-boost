import { StringMap } from '@shared/types';
import { Request } from 'express';
import { User } from 'src/modules/User/entities/user.entity';

export type AppRequest = Omit<Request, 'user' | 'cookies'> & {
    user: User | null;
    cookies: StringMap<string>;
};
