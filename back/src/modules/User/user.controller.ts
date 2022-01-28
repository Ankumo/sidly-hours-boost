import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { AppRequest } from 'src/defaults/types';
import { RootAuth } from 'src/utils/decorators';
import { ChangePasswordDTO, CreateUserDTO, UpdateUserDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private service: UserService) {}

    @RootAuth()
    @Get('id/:id')
    async getById(@Param('id') id: number) {
        return this.service.repo.findById(id);
    }

    @RootAuth()
    @Put('')
    async create(@Body() dto: CreateUserDTO) {
        return this.service.createUser(dto);
    }

    @Patch('')
    async update(@Body() dto: UpdateUserDTO, @Req() req: AppRequest) {
        return this.service.updateUser(dto, req);
    }

    @RootAuth()
    @Get('all')
    async getAllUsers() {
        return this.service.getAllUsers();
    }

    @RootAuth()
    @Delete('id/:id')
    async deleteUser(@Param('id') id: number) {
        return this.service.deleteUser(id);
    }

    @Post('change-password')
    async changePassword(
        @Body() dto: ChangePasswordDTO,
        @Req() req: AppRequest,
    ) {
        return this.service.changePassword(dto, req);
    }

    @RootAuth()
    @Patch('id/:id')
    async resetPassword(@Param('id') id: number) {
        return this.service.resetPassword(id);
    }
}
