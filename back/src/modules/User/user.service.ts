import {
    BadRequestException,
    Injectable,
    OnApplicationBootstrap,
} from '@nestjs/common';
import appConfig from 'src/utils/config';
import { getMd5, pick } from 'src/utils';
import { UserRepository } from './user.repository';
import chalk from 'chalk';
import { ChangePasswordDTO, CreateUserDTO, UpdateUserDTO } from './user.dto';
import { Res } from 'src/utils/res';
import { EventsService } from '../Events/events.service';
import { ApiErr } from '@shared/types';
import { AppRequest } from 'src/defaults/types';
import { Not } from 'typeorm';
import config from 'src/utils/config';
import { AccountService } from '../Account/account.service';

@Injectable()
export class UserService implements OnApplicationBootstrap {
    constructor(
        public repo: UserRepository,
        private sse: EventsService,
        private accountService: AccountService,
    ) {}

    async createUser(dto: CreateUserDTO) {
        const exUser = await this.repo.findOne({
            select: ['id'],
            where: {
                username: dto.username,
            },
        });

        if (exUser) {
            return new Res(false, ApiErr.UserAlreadyExists);
        }

        const newUser = await this.repo.save({
            ...dto,
            nickname: dto.username,
            password: getMd5(dto.password),
        });

        if (!newUser) {
            throw new BadRequestException();
        }

        delete newUser.password;

        return new Res(true, pick(newUser, 'id', 'username', 'nickname'));
    }

    async updateUser(dto: UpdateUserDTO, req: AppRequest) {
        await this.repo.save({
            ...dto,
            id: req.user.id,
        });

        return new Res(true);
    }

    async deleteUser(id: number) {
        const user = await this.repo.findOne({
            where: {
                id,
            },
            select: ['id', 'username'],
        });

        if (!user) {
            return new Res(false, ApiErr.UserNotFound);
        }

        if (user.isRoot) {
            return new Res(false, ApiErr.CannotDeleteRootUser);
        }

        await this.accountService.destroyUserBots(user.id);

        await this.repo.delete({
            id,
        });

        this.sse.tellClients('user_deleted', {
            username: user.username,
        });
        return new Res();
    }

    async getAllUsers() {
        return new Res(
            true,
            await this.repo.find({
                where: {
                    username: Not(config.rootUser),
                },
            }),
        );
    }

    async changePassword(dto: ChangePasswordDTO, req: AppRequest) {
        const user = await this.repo.findOne({
            select: ['id', 'password'],
            where: {
                id: req.user.id,
            },
        });

        if (!user) {
            return new Res(false, ApiErr.UserNotFound);
        }

        if (user.password !== getMd5(dto.oldPassword)) {
            return new Res(false, ApiErr.OldPasswordIncorrect);
        }

        await this.repo.save({
            id: req.user.id,
            password: getMd5(dto.password),
        });

        return new Res();
    }

    async resetPassword(id: number) {
        const user = await this.repo.findOne({
            where: {
                id,
            },
            select: ['id'],
        });

        if (!user) {
            return new Res(false, ApiErr.UserNotFound);
        }

        let newPassword = '';
        const alph = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

        for (let i = 0; i < 8; i++) {
            newPassword += alph[Math.floor(Math.random() * alph.length)];
        }

        await this.repo.save({
            id,
            password: getMd5(newPassword),
        });

        return new Res(true, newPassword);
    }

    async onApplicationBootstrap() {
        const { rootUser } = appConfig;

        const user = await this.repo.findOne({
            select: ['id'],
            where: {
                nickname: rootUser,
            },
        });

        if (!user) {
            console.log(
                `Created missing root user ${chalk.yellow(
                    rootUser,
                )} with password ${chalk.yellowBright('12345')}`,
            );

            await this.repo.save({
                nickname: rootUser,
                password: getMd5('12345'),
                username: rootUser,
            });
        }
    }
}
