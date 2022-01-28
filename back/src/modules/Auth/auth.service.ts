import { Injectable } from '@nestjs/common';
import { getMd5 } from 'src/utils';
import config from 'src/utils/config';
import { DeepPartial, getCustomRepository } from 'typeorm';
import { UserSession } from '../User/entities/user-session.entity';
import { UserRepository } from '../User/user.repository';
import { LoginDTO } from './auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { AppRequest } from 'src/defaults/types';

@Injectable()
export class AuthService {
    async login(
        { username, password }: LoginDTO,
        req: AppRequest,
    ): Promise<DeepPartial<UserSession> | null> {
        const userRepo = getCustomRepository(UserRepository);

        password = getMd5(password);

        const user = await userRepo.findOne({
            select: ['id'],
            where: {
                username,
                password,
            },
            relations: ['sessions'],
        });

        if (!user) {
            return null;
        }

        const newSession: DeepPartial<UserSession> = {
            expires: new Date(Date.now() + config.cookieLifetime * 1000),
            hash: uuidv4(),
        };

        await userRepo.save({
            ...user,
            ip: req.ip,
            sessions: [
                ...user.sessions
                    .filter((us) => us.expires > new Date())
                    .slice(-10),
                newSession,
            ],
        });

        return newSession;
    }
}
