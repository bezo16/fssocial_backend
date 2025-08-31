import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindOneUserDto } from './dto/find-one-user.dto';

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
  usersTable: {
    id: 'id',
    username: 'username',
    email: 'email',
    password_hash: 'password_hash',
    avatarUrl: 'avatarUrl',
    bio: 'bio',
    created_at: 'created_at',
    updated_at: 'updated_at',
  },
  followsTable: {
    followerId: 'followerId',
    followingId: 'followingId',
  },
}));

// Mock drizzle-orm functions
jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => `${field} = ${value}`),
  sql: jest.fn(() => 'sql_expression'),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const mockDb = jest.requireMock('lib/drizzle').default;

    // Setup simple mock chains
    const mockQueryChain = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      orderBy: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockDb.select.mockReturnValue(mockQueryChain);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockDb.insert.mockReturnValue(mockQueryChain);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    mockDb.update.mockReturnValue(mockQueryChain);

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      const createUserParams = {
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      };

      const expectedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
        created_at: new Date(),
        updated_at: new Date(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mockDb = jest.requireMock('lib/drizzle').default;
      const mockQueryChain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([expectedUser]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.insert.mockReturnValue(mockQueryChain);

      const result = await service.createUser(createUserParams);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findOneUserByUsername', () => {
    it('should find and return user by username', async () => {
      const findOneUserDto: FindOneUserDto = { username: 'testuser' };
      const expectedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mockDb = jest.requireMock('lib/drizzle').default;
      const mockQueryChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([expectedUser]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockQueryChain);

      const result = await service.findOneUserByUsername(findOneUserDto);

      expect(result).toEqual(expectedUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const findOneUserDto: FindOneUserDto = { username: 'nonexistent' };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mockDb = jest.requireMock('lib/drizzle').default;
      const mockQueryChain = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.select.mockReturnValue(mockQueryChain);

      await expect(
        service.findOneUserByUsername(findOneUserDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateUserMe', () => {
    it('should successfully update user bio', async () => {
      const userId = '1';
      const updateBody = { bio: 'Updated bio' };
      const expectedUser = {
        id: '1',
        username: 'testuser',
        bio: 'Updated bio',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mockDb = jest.requireMock('lib/drizzle').default;
      const mockQueryChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([expectedUser]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.update.mockReturnValue(mockQueryChain);

      const result = await service.updateUserMe(userId, updateBody);

      expect(result).toEqual(expectedUser);
    });

    it('should return failure message when no data to update', async () => {
      const userId = '1';
      const updateBody = {};

      const result = await service.updateUserMe(userId, updateBody);

      expect(result).toEqual({
        success: false,
        message: 'No data to update',
      });
    });
  });

  describe('updateUserMeAvatar', () => {
    it('should successfully update user avatar', async () => {
      const userId = '1';
      const mockFile = {
        filename: 'avatar.jpg',
      } as Express.Multer.File;

      const expectedUser = {
        id: '1',
        username: 'testuser',
        avatarUrl: '/avatars/avatar.jpg',
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const mockDb = jest.requireMock('lib/drizzle').default;
      const mockQueryChain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([expectedUser]),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      mockDb.update.mockReturnValue(mockQueryChain);

      const result = await service.updateUserMeAvatar(userId, mockFile);

      expect(result).toEqual(expectedUser);
    });

    it('should throw error when no file uploaded', async () => {
      const userId = '1';

      await expect(service.updateUserMeAvatar(userId, null!)).rejects.toThrow(
        'No file uploaded',
      );
    });
  });
});
