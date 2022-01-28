import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SteamApiController } from './steam-api.controller';
import { SteamApiService } from './steam-api.service';

@Module({
    imports: [HttpModule],
    exports: [SteamApiService],
    controllers: [SteamApiController],
    providers: [SteamApiService],
})
export class SteamApiModule {}
