import { Controller } from '@nestjs/common';
import { SteamApiService } from './steam-api.service';

@Controller('steam-api')
export class SteamApiController {
    constructor(private service: SteamApiService) {}
}
