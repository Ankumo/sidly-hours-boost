import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsPositive,
} from 'class-validator';

export class IdDTO {
    @IsInt()
    @IsNotEmpty()
    @IsPositive()
    id: number;
}

export class IdsDTO {
    @ArrayNotEmpty()
    @IsArray()
    ids: number[];
}

export class StringsDTO {
    @ArrayNotEmpty()
    @IsArray()
    ids: string[];
}
