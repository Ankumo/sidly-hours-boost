import {
    Body,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { AppRequest } from 'src/defaults/types';
import {
    AddAccountDTO,
    GamesDTO,
    PersonaStateDTO,
    ProceedAccountDTO,
    SetTitleDTO,
    ShareDTO,
} from './account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
    constructor(private service: AccountService) {}

    @Delete('id/:id')
    async delete(@Param('id') id: number, @Req() req: AppRequest) {
        return this.service.delete(id, req);
    }

    @Post('')
    async add(@Body() dto: AddAccountDTO, @Req() req: AppRequest) {
        return this.service.add(dto, req);
    }

    @Post('proceed')
    async proceed(@Body() dto: ProceedAccountDTO, @Req() req: AppRequest) {
        return this.service.proceed(dto, req);
    }

    @Put('boost/:id')
    async runBoost(@Param('id') id: number, @Req() req: AppRequest) {
        return this.service.runBoost(id, req);
    }

    @Delete('boost/:id')
    async stopBoost(@Param('id') id: number, @Req() req: AppRequest) {
        return this.service.stopBoost(id, req);
    }

    @Post('logOn/:id')
    async logOn(@Param('id') id: number, @Req() req: AppRequest) {
        return this.service.logOn(id, req);
    }

    @Post('logOff/:id')
    async logOff(@Param('id') id: number, @Req() req: AppRequest) {
        return this.service.logOff(id, req);
    }

    @Patch('persona-state')
    async personaState(@Body() dto: PersonaStateDTO, @Req() req: AppRequest) {
        return this.service.personaState(dto, req);
    }

    @Patch('title')
    async setTitle(@Body() dto: SetTitleDTO, @Req() req: AppRequest) {
        return this.service.setTitle(dto, req);
    }

    @Patch('game')
    async toggleGame(@Body() dto: GamesDTO, @Req() req: AppRequest) {
        return this.service.gamesPlayed(dto, req);
    }

    @Post('share')
    async toggleShare(@Body() dto: ShareDTO, @Req() req: AppRequest) {
        return this.service.toggleShare(dto, req);
    }
}
