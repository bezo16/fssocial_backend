import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLikeDto } from './dto/create-like.dto';

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
  likesTable: {
    id: 'id',
    userId: 'userId',
    targetType: 'targetType',
    targetId: 'targetId',
  },
  postsTable: { id: 'id', content: 'content', authorId: 'authorId' },
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
  },
}));

describe('LikesService', () => {
  let service: LikesService;
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
        LikesService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createLikeDto: CreateLikeDto = {
      targetType: 'post',
      targetId: 'post-123',
    };
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks for database operations
      const mockInsert = {
        values: jest.fn().mockResolvedValue(undefined),
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

    it('should create a like successfully', async () => {
      const result = await service.create(createLikeDto, userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          userId: 'userId',
          targetType: 'targetType',
          targetId: 'targetId',
        }),
      );
      expect(result).toEqual({ message: 'Like created' });
    });

    it('should create notification when liking a post by different user', async () => {
      await service.create(createLikeDto, userId);

      expect(mockNotificationsService.create).toHaveBeenCalledWith({
        toUserId: 'author-456',
        fromUserId: userId,
        type: 'like',
        message: 'Váš príspevok bol označený ako páči sa mi to.',
      });
    });

    it('should not create notification when liking own post', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            id: 'post-123',
            authorId: userId, // Same user as liker
            content: 'Original post content',
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.create(createLikeDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should not create notification when post is not found', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]), // No post found
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.create(createLikeDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should not create notification for non-post target types', async () => {
      const profileLikeDto: CreateLikeDto = {
        targetType: 'profile',
        targetId: 'user-456',
      };

      await service.create(profileLikeDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });

    it('should not create notification when toUserId is null', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            id: 'post-123',
            authorId: null, // No author
            content: 'Orphaned post',
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.create(createLikeDto, userId);

      expect(mockNotificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const targetType = 'post' as const;
    const targetId = 'post-123';
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mock for delete operation
      const mockDelete = {
        where: jest.fn().mockResolvedValue(undefined),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.delete.mockReturnValue(mockDelete);
    });

    it('should successfully remove a like', async () => {
      const result = await service.remove(targetType, targetId, userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          userId: 'userId',
          targetType: 'targetType',
          targetId: 'targetId',
        }),
      );
      expect(result).toEqual({ message: 'Like removed' });
    });

    it('should handle profile target type', async () => {
      const result = await service.remove('profile', 'user-456', userId);

      expect(result).toEqual({ message: 'Like removed' });
    });

    it('should handle comment target type', async () => {
      const result = await service.remove('comment', 'comment-789', userId);

      expect(result).toEqual({ message: 'Like removed' });
    });

    it('should use correct conditions for deletion', async () => {
      const mockWhere = jest.fn().mockResolvedValue(undefined);
      const mockDelete = {
        where: mockWhere,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.delete.mockReturnValue(mockDelete);

      await service.remove(targetType, targetId, userId);

      expect(mockWhere).toHaveBeenCalled();
    });
  });
});
