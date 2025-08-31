import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateCommentDto, CommentTargetType } from './dto/create-comment.dto';

// Mock the database connection
jest.mock('lib/drizzle', () => ({
  default: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock the schema
jest.mock('lib/drizzle/schema', () => ({
  postsTable: { id: 'id', content: 'content', authorId: 'authorId' },
  commentsTable: {
    id: 'id',
    content: 'content',
    targetId: 'targetId',
    targetType: 'targetType',
    userId: 'userId',
  },
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
  },
}));

describe('CommentsService', () => {
  let service: CommentsService;
  let mockNotificationsService: Partial<NotificationsService>;
  let mockDb: any;

  beforeEach(async () => {
    // Get the mocked database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mockDb = jest.requireMock('lib/drizzle').default;

    // Reset mocks
    jest.clearAllMocks();

    // Create mock services
    mockNotificationsService = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 1, message: 'Test notification' }),
      findAllForUser: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCommentDto: CreateCommentDto = {
      targetType: CommentTargetType.POST,
      targetId: 'post-123',
      content: 'This is a test comment',
    };
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks for database operations
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: 'comment-123',
            userId,
            targetType: CommentTargetType.POST,
            targetId: 'post-123',
            content: 'This is a test comment',
            createdAt: new Date(),
          },
        ]),
      };

      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            id: 'post-123',
            authorId: 'author-456',
            content: 'Original post content',
          },
        ]),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.insert.mockReturnValue(mockInsert);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);
    });

    it('should create a comment successfully', async () => {
      const result = await service.create(createCommentDto, userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          content: 'content',
          targetId: 'targetId',
          targetType: 'targetType',
          userId: 'userId',
        }),
      );
      expect(result).toEqual({
        id: 'comment-123',
        userId,
        targetType: CommentTargetType.POST,
        targetId: 'post-123',
        content: 'This is a test comment',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        createdAt: expect.any(Date),
      });
    });

    it('should create notification when commenting on a post by different user', async () => {
      await service.create(createCommentDto, userId);

      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        toUserId: 'author-456',
        fromUserId: userId,
        type: 'comment',
        message: 'Váš príspevok bol komentovaný.',
      });
    });

    it('should not create notification when commenting on own post', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            id: 'post-123',
            authorId: userId, // Same user as commenter
            content: 'Original post content',
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.create(createCommentDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should not create notification when post is not found', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]), // No post found
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.create(createCommentDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should not create notification for non-POST target types', async () => {
      const nonPostCommentDto: CreateCommentDto = {
        targetType: 'comment' as CommentTargetType, // Comment on comment
        targetId: 'comment-456',
        content: 'Reply to comment',
      };

      await service.create(nonPostCommentDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const commentId = 'comment-123';
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mock for delete operation
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: commentId,
            userId,
            content: 'Deleted comment',
            targetId: 'post-123',
            targetType: CommentTargetType.POST,
          },
        ]),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.delete.mockReturnValue(mockDelete);
    });

    it('should successfully remove a comment by authorized user', async () => {
      const result = await service.remove(commentId, userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          content: 'content',
          targetId: 'targetId',
          targetType: 'targetType',
          userId: 'userId',
        }),
      );
      expect(result).toEqual({
        id: commentId,
        userId,
        content: 'Deleted comment',
        targetId: 'post-123',
        targetType: CommentTargetType.POST,
      });
    });

    it('should return undefined when comment not found or user unauthorized', async () => {
      const mockDelete = {
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // No comment deleted
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.delete.mockReturnValue(mockDelete);

      const result = await service.remove(commentId, 'wrong-user-id');

      expect(result).toBeUndefined();
    });

    it('should use correct conditions for deletion', async () => {
      const mockWhere = jest.fn().mockReturnThis();
      const mockDelete = {
        where: mockWhere,
        returning: jest.fn().mockResolvedValue([
          {
            id: commentId,
            userId,
            content: 'Deleted comment',
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.delete.mockReturnValue(mockDelete);

      await service.remove(commentId, userId);

      expect(mockWhere).toHaveBeenCalled();
    });
  });
});
