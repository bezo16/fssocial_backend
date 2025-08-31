import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
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
  likesTable: { id: 'id', userId: 'userId', postId: 'postId' },
  postsTable: { id: 'id', content: 'content', userId: 'userId' },
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
  },
}));

describe('LikesController', () => {
  let controller: LikesController;
  let mockLikesService: Partial<LikesService>;
  let mockNotificationsService: Partial<NotificationsService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Create mock services
    mockLikesService = {
      create: jest.fn().mockResolvedValue({ success: true }),
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
      controllers: [LikesController],
      providers: [
        {
          provide: LikesService,
          useValue: mockLikesService,
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

    controller = module.get<LikesController>(LikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
