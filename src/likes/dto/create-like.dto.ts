import { IsUUID, IsIn } from 'class-validator';

export class CreateLikeDto {
  @IsIn(['post', 'profile', 'comment'])
  targetType: 'post' | 'profile' | 'comment';

  @IsUUID()
  targetId: string;
}
