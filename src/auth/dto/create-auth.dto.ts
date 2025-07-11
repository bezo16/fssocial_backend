import { IsString } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  password: string;
}
