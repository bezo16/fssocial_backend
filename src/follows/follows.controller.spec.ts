import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
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
  followsTable: { followerId: 'followerId', followingId: 'followingId' },
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
  },
}));

describe('FollowsController', () => {
  let controller: FollowsController;
  let mockFollowsService: Partial<FollowsService>;
  let mockNotificationsService: Partial<NotificationsService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Create mock services
    mockFollowsService = {
      followUser: jest.fn().mockResolvedValue({ success: true }),
      unFollowUser: jest.fn().mockResolvedValue({ success: true }),
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
      controllers: [FollowsController],
      providers: [
        {
          provide: FollowsService,
          useValue: mockFollowsService,
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

    controller = module.get<FollowsController>(FollowsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
