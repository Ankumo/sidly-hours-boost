import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    username: string;

    @IsString()
    @IsNotEmpty()
    @Length(5, 30)
    password: string;
}
