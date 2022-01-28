import { Locales, LocalesList } from '@shared/types';
import { IsIn, IsNotEmpty, IsString, Length } from 'class-validator';
import { LoginDTO } from '../Auth/auth.dto';

export class CreateUserDTO extends LoginDTO {}
export class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    nickname: string;

    @IsString()
    @IsIn(LocalesList)
    @IsNotEmpty()
    lang: Locales;
}

export class ChangePasswordDTO {
    @IsString()
    @IsNotEmpty()
    @Length(5, 30)
    password: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 30)
    oldPassword: string;
}
