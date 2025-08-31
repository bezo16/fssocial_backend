import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
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
  usersTable: { id: 'id', username: 'username', email: 'email' },
  followsTable: { followerId: 'followerId', followingId: 'followingId' },
}));

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  let mockJwtService: Partial<JwtService>;

  beforeEach(async () => {
    // Create mock services
    mockUsersService = {
      findUserById: jest
        .fn()
        .mockResolvedValue({ id: 1, username: 'testuser' }),
      findUserMe: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
      updateUserMe: jest
        .fn()
        .mockResolvedValue({ id: 1, username: 'testuser' }),
      findRandomUsers: jest
        .fn()
        .mockResolvedValue([{ id: 1, username: 'testuser' }]),
      searchUsers: jest
        .fn()
        .mockResolvedValue([{ id: 1, username: 'testuser' }]),
    };

    mockJwtService = {
      verify: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
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

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
