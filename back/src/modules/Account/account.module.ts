import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../Events/events.module';
import { AccountController } from './account.controller';
import { AccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([AccountRepository]),
        forwardRef(() => EventsModule),
    ],
    exports: [AccountService],
    controllers: [AccountController],
    providers: [AccountService],
})
export class AccountModule {}
