import { Test, TestingModule } from '@nestjs/testing';
import { FollowsService } from './follows.service';
import { NotificationsService } from '../notifications/notifications.service';

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

describe('FollowsService', () => {
  let service: FollowsService;
  let mockNotificationsService: Partial<NotificationsService>;

  beforeEach(async () => {
    // Create mock services
    mockNotificationsService = {
      create: jest
        .fn()
        .mockResolvedValue({ id: 1, message: 'Test notification' }),
      findAllForUser: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
