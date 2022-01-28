import { forwardRef, Module } from '@nestjs/common';
import { AccountModule } from '../Account/account.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
    imports: [forwardRef(() => AccountModule)],
    exports: [EventsService],
    controllers: [EventsController],
    providers: [EventsService],
})
export class EventsModule {}
