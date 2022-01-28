import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../Account/account.module';
import { EventsModule } from '../Events/events.module';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRepository]),
        EventsModule,
        AccountModule,
    ],
    exports: [UserService],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
