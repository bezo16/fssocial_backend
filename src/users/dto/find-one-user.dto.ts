import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class FindOneUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;
}
