import { Body, Controller, Post, Req } from '@nestjs/common';
import { NoAuth } from 'src/utils/decorators';
import { AppRequest } from 'src/defaults/types';
import { AuthService } from './auth.service';
import { LoginDTO } from './auth.dto';
import { Res } from 'src/utils/res';
import { ApiErr } from '@shared/types';

@Controller('auth')
export class AuthController {
    constructor(private service: AuthService) {}

    @NoAuth()
    @Post('login')
    async login(@Body() dto: LoginDTO, @Req() req: AppRequest) {
        const session = await this.service.login(dto, req);

        if (session === null) {
            return new Res(false, ApiErr.InvalidPassword);
        }

        return new Res(true, session);
    }
}
