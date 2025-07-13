import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
