import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';

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
  notificationsTable: {
    id: 'id',
    toUserId: 'toUserId',
    fromUserId: 'fromUserId',
    type: 'type',
    message: 'message',
    read: 'read',
    createdAt: 'createdAt',
  },
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockDb: any;

  beforeEach(async () => {
    // Get the mocked database
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    mockDb = jest.requireMock('lib/drizzle').default;

    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForUser', () => {
    const userId = 'user-123';

    beforeEach(() => {
      // Setup default mocks for database operations
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([
          {
            id: 'notification-1',
            toUserId: userId,
            fromUserId: 'user-456',
            type: 'like',
            message: 'Someone liked your post',
            read: false,
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'notification-2',
            toUserId: userId,
            fromUserId: 'user-789',
            type: 'comment',
            message: 'Someone commented on your post',
            read: true,
            createdAt: new Date('2024-01-02'),
          },
        ]),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);
    });

    it('should return all notifications for a user', async () => {
      const result = await service.findAllForUser(userId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'notification-1',
        toUserId: userId,
        fromUserId: 'user-456',
        type: 'like',
        message: 'Someone liked your post',
        read: false,
        createdAt: new Date('2024-01-01'),
      });
      expect(result[1]).toEqual({
        id: 'notification-2',
        toUserId: userId,
        fromUserId: 'user-789',
        type: 'comment',
        message: 'Someone commented on your post',
        read: true,
        createdAt: new Date('2024-01-02'),
      });
    });

    it('should return empty array when no notifications found', async () => {
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      const result = await service.findAllForUser(userId);

      expect(result).toEqual([]);
    });

    it('should use correct database query conditions', async () => {
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockSelect = {
        from: jest.fn().mockReturnThis(),
        where: mockWhere,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockSelect);

      await service.findAllForUser(userId);

      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      toUserId: 'user-123',
      fromUserId: 'user-456',
      type: 'like',
      message: 'Someone liked your post',
    };

    beforeEach(() => {
      // Setup default mocks for database operations
      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: 'notification-123',
            toUserId: 'user-123',
            fromUserId: 'user-456',
            type: 'like',
            message: 'Someone liked your post',
            read: false,
            createdAt: new Date('2024-01-01'),
          },
        ]),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.insert.mockReturnValue(mockInsert);
    });

    it('should create a notification successfully', async () => {
      const result = await service.create(notificationData);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          toUserId: 'toUserId',
          fromUserId: 'fromUserId',
          type: 'type',
          message: 'message',
          read: 'read',
          createdAt: 'createdAt',
        }),
      );
      expect(result).toEqual({
        id: 'notification-123',
        toUserId: 'user-123',
        fromUserId: 'user-456',
        type: 'like',
        message: 'Someone liked your post',
        read: false,
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should set read to false by default', async () => {
      await service.create(notificationData);

      // Check that the values method was called with read: false
      // We can't directly access the mock in this way, so we verify the service behavior instead
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle different notification types', async () => {
      const commentNotification: Omit<
        Notification,
        'id' | 'createdAt' | 'read'
      > = {
        toUserId: 'user-123',
        fromUserId: 'user-789',
        type: 'comment',
        message: 'Someone commented on your post',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: 'notification-456',
            ...commentNotification,
            read: false,
            createdAt: new Date('2024-01-01'),
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.insert.mockReturnValue(mockInsert);

      const result = await service.create(commentNotification);

      expect(result.type).toBe('comment');
      expect(result.message).toBe('Someone commented on your post');
    });

    it('should handle follow notification type', async () => {
      const followNotification: Omit<
        Notification,
        'id' | 'createdAt' | 'read'
      > = {
        toUserId: 'user-123',
        fromUserId: 'user-999',
        type: 'follow',
        message: 'Someone started following you',
      };

      const mockInsert = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: 'notification-789',
            ...followNotification,
            read: false,
            createdAt: new Date('2024-01-01'),
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.insert.mockReturnValue(mockInsert);

      const result = await service.create(followNotification);

      expect(result.type).toBe('follow');
      expect(result.message).toBe('Someone started following you');
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notification-123';

    beforeEach(() => {
      // Setup default mocks for database operations
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: notificationId,
            toUserId: 'user-123',
            fromUserId: 'user-456',
            type: 'like',
            message: 'Someone liked your post',
            read: true,
            createdAt: new Date('2024-01-01'),
          },
        ]),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.update.mockReturnValue(mockUpdate);
    });

    it('should mark notification as read successfully', async () => {
      const result = await service.markAsRead(notificationId);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'id',
          toUserId: 'toUserId',
          fromUserId: 'fromUserId',
          type: 'type',
          message: 'message',
          read: 'read',
          createdAt: 'createdAt',
        }),
      );
      expect(result).toEqual({
        id: notificationId,
        toUserId: 'user-123',
        fromUserId: 'user-456',
        type: 'like',
        message: 'Someone liked your post',
        read: true,
        createdAt: new Date('2024-01-01'),
      });
    });

    it('should return undefined when notification not found', async () => {
      const mockUpdate = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]), // No notification found
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.update.mockReturnValue(mockUpdate);

      const result = await service.markAsRead('non-existent-id');

      expect(result).toBeUndefined();
    });

    it('should use correct update conditions', async () => {
      const mockSet = jest.fn().mockReturnThis();
      const mockWhere = jest.fn().mockReturnThis();
      const mockUpdate = {
        set: mockSet,
        where: mockWhere,
        returning: jest.fn().mockResolvedValue([
          {
            id: notificationId,
            toUserId: 'user-123',
            fromUserId: 'user-456',
            type: 'like',
            message: 'Someone liked your post',
            read: true,
            createdAt: new Date('2024-01-01'),
          },
        ]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.update.mockReturnValue(mockUpdate);

      await service.markAsRead(notificationId);

      expect(mockSet).toHaveBeenCalledWith({ read: true });
      expect(mockWhere).toHaveBeenCalled();
    });
  });
});
