import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: Partial<AuthService>;
  let mockJwtService: Partial<JwtService>;
  let mockUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      register: jest.fn().mockResolvedValue({ success: true }),
      login: jest.fn().mockResolvedValue({ token: 'mock-token' }),
      verifyToken: jest.fn().mockReturnValue({
        valid: true,
        decoded: { id: 1, email: 'test@example.com' },
      }),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
    };

    mockUsersService = {
      createUser: jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }),
      findOneUserByUsername: jest
        .fn()
        .mockResolvedValue({ id: 1, email: 'test@example.com' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
