import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';
import { EPersonaState } from 'steam-user';
import { IdDTO } from '../../defaults/dto';
import { SteamBotCustomTitle } from '@shared/types';

export class AddAccountDTO {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    isKnown: boolean;
}

export class ProceedAccountDTO extends IdDTO {
    @IsString()
    @IsNotEmpty()
    @Length(5, 5)
    code: string;

    @IsBoolean()
    @IsOptional()
    runBoost?: boolean;
}

export class PersonaStateDTO extends IdDTO {
    @IsNotEmpty()
    @IsEnum(EPersonaState)
    state: EPersonaState;
}

export class GamesDTO extends IdDTO {
    @IsNotEmpty()
    @IsArray()
    appIds: number[];

    @IsBoolean()
    type: boolean;
}

export class SetTitleDTO extends IdDTO {
    @IsNotEmpty()
    @IsObject()
    title: SteamBotCustomTitle;
}

export class ShareDTO extends IdDTO {
    @IsString()
    @IsNotEmpty()
    username: string;
}
/*
export class LogonDTO extends IdDTO {
    @IsString()
    @IsOptional()
    password?: string;
}*/
