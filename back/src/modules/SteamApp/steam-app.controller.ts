import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { IdsDTO } from 'src/defaults/dto';
import { AppRequest } from 'src/defaults/types';
import { SteamAppService } from './steam-app.service';

@Controller('steam-app')
export class SteamAppController {
    constructor(private service: SteamAppService) {}

    @Get('search/:text')
    async search(@Param('text') text: string, @Req() req: AppRequest) {
        return this.service.search(text, 0, req);
    }

    @Get('search/:text/account/:id')
    async searchOwned(
        @Param('text') text: string,
        @Param('id') accountId: number,
        @Req() req: AppRequest,
    ) {
        return this.service.search(text, accountId, req);
    }

    @Get('locale/:appid')
    async getAppLocalization(@Param('appid') appid: number) {
        return this.service.getAppLocalization(appid);
    }

    @Post('by-ids')
    async getAppsByIds(@Body() dto: IdsDTO) {
        return this.service.getByIds(dto);
    }
}
