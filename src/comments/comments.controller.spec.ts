import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { JwtAuthGuard } from 'lib/auth/JwtAuthGuard';

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
  postsTable: { id: 'id', content: 'content', userId: 'userId' },
  commentsTable: {
    id: 'id',
    content: 'content',
    postId: 'postId',
    userId: 'userId',
  },
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
  },
}));

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: Partial<CommentsService>;
  let mockNotificationsService: Partial<NotificationsService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Create mock services
    mockCommentsService = {
      create: jest.fn().mockResolvedValue({ id: 1, content: 'Test comment' }),
      remove: jest.fn().mockResolvedValue({ success: true }),
    };

    mockNotificationsService = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 1, message: 'Test notification' }),
      findAllForUser: jest.fn().mockResolvedValue([]),
    };

    mockJwtService = {
      verify: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
