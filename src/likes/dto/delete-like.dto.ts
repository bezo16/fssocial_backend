import { IsUUID, IsIn } from 'class-validator';

export class DeleteLikeDto {
  @IsIn(['post', 'profile', 'comment'])
  targetType: 'post' | 'profile' | 'comment';

  @IsUUID()
  targetId: string;
}
