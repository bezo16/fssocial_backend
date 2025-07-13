import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
