import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';

export enum CommentTargetType {
  POST = 'post',
  PROFILE = 'profile',
}

export class CreateCommentDto {
  @IsEnum(CommentTargetType)
  targetType: CommentTargetType;

  @IsUUID()
  targetId: string;

  @IsString()
  @MinLength(1)
  content: string;
}
