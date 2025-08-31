import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Response } from 'express';

// Mock external dependencies
jest.mock('lib/argon2/generatePasswordHash', () => ({
  default: jest.fn().mockResolvedValue('hashed_password_123'),
}));

jest.mock('lib/auth/verifyPassword', () => ({
  default: jest.fn().mockResolvedValue(true),
}));

interface MockPasswordHashModule {
  default: jest.Mock;
}

interface MockVerifyPasswordModule {
  default: jest.Mock;
}

interface MockJwtService {
  sign: jest.Mock;
  signAsync: jest.Mock;
  verify: jest.Mock;
}

interface MockUsersService {
  createUser: jest.Mock;
  findOneUserByUsername: jest.Mock;
}

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: MockJwtService;
  let mockUsersService: MockUsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Create mock services
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
      verify: jest.fn().mockReturnValue({ id: 1, email: 'test@example.com' }),
    };

    mockUsersService = {
      createUser: jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      }),
      findOneUserByUsername: jest.fn().mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      }),
    };

    // Mock Express Response object
    mockResponse = {
      cookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
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

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto: RegisterAuthDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.register(registerDto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      });
      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      });
    });

    it('should hash the password before creating user', async () => {
      const generatePasswordHashModule =
        jest.requireMock<MockPasswordHashModule>(
          'lib/argon2/generatePasswordHash',
        );
      const registerDto: RegisterAuthDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'plainPassword123',
      };

      await service.register(registerDto);

      expect(generatePasswordHashModule.default).toHaveBeenCalledWith(
        'plainPassword123',
      );
    });

    it('should handle user creation failure', async () => {
      const registerDto: RegisterAuthDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.createUser.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto: LoginAuthDto = {
        username: 'testuser',
        password: 'password123',
      };

      const result = await service.login(loginDto, mockResponse as Response);

      expect(mockUsersService.findOneUserByUsername).toHaveBeenCalledWith({
        username: 'testuser',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_123',
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'authToken',
        'mock-jwt-token',
        {
          httpOnly: true,
          secure: true,
          maxAge: 36000000,
          sameSite: 'none',
          path: '/',
        },
      );
      expect(result).toEqual({ token: 'mock-jwt-token' });
    });

    it('should verify password during login', async () => {
      const verifyPasswordModule = jest.requireMock<MockVerifyPasswordModule>(
        'lib/auth/verifyPassword',
      );
      const loginDto: LoginAuthDto = {
        username: 'testuser',
        password: 'password123',
      };

      await service.login(loginDto, mockResponse as Response);

      expect(verifyPasswordModule.default).toHaveBeenCalledWith(
        'hashed_password_123',
        'password123',
      );
    });

    it('should handle user not found', async () => {
      const loginDto: LoginAuthDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUsersService.findOneUserByUsername.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(
        service.login(loginDto, mockResponse as Response),
      ).rejects.toThrow('User not found');
    });

    it('should handle password verification failure', async () => {
      const verifyPasswordModule = jest.requireMock<MockVerifyPasswordModule>(
        'lib/auth/verifyPassword',
      );
      const loginDto: LoginAuthDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      verifyPasswordModule.default.mockRejectedValue(
        new Error('Invalid password'),
      );

      await expect(
        service.login(loginDto, mockResponse as Response),
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify a valid token', () => {
      const validToken = 'valid-jwt-token';
      const expectedDecoded = { id: 1, email: 'test@example.com' };

      mockJwtService.verify.mockReturnValue(expectedDecoded);

      const result = service.verifyToken(validToken);

      expect(mockJwtService.verify).toHaveBeenCalledWith(validToken);
      expect(result).toEqual({
        valid: true,
        decoded: expectedDecoded,
      });
    });

    it('should handle invalid token', () => {
      const invalidToken = 'invalid-jwt-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => service.verifyToken(invalidToken)).toThrow('Invalid token');
      expect(mockJwtService.verify).toHaveBeenCalledWith(invalidToken);
    });

    it('should handle expired token', () => {
      const expiredToken = 'expired-jwt-token';

      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verifyToken(expiredToken)).toThrow('Invalid token');
    });
  });
});
