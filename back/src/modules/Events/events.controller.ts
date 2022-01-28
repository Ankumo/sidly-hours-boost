import { Controller, Req, Sse } from '@nestjs/common';
import { AppRequest } from 'src/defaults/types';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private service: EventsService) {}

    @Sse('')
    sse(@Req() req: AppRequest) {
        return this.service.subscribe(req);
    }
}
