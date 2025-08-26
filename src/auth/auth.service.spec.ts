import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: '60f7b3b3b3f3f3f3f3f3f3f3',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
  } as any;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    validatePassword: jest.fn(),
    updateRefreshToken: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    signAsync: jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve('mocked_token_' + Math.random()),
      ),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret-key';
        case 'JWT_REFRESH_SECRET':
          return 'test-refresh-secret';
        case 'JWT_EXPIRES_IN':
          return '15m';
        case 'JWT_REFRESH_EXPIRES_IN':
          return '7d';
        default:
          return undefined;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      
      // Mock the JWT tokens to be predictable
      jwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isActive: mockUser.isActive,
        },
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      
      // Mock the JWT tokens to be predictable
      jwtService.signAsync
        .mockResolvedValueOnce('access_token')
        .mockResolvedValueOnce('refresh_token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isActive: mockUser.isActive,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const decodedToken = { sub: mockUser.id, email: mockUser.email };

      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue({
        ...mockUser,
        refreshToken: 'valid_refresh_token', // Mock the stored refresh token
      });
      
      // Mock the JWT tokens to be predictable
      jwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.refreshTokens(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: expect.any(String),
      });
      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isActive: mockUser.isActive,
        },
      });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const refreshToken = 'invalid_refresh_token';
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid_refresh_token';
      const decodedToken = { sub: mockUser.id, email: mockUser.email };

      jwtService.verify.mockReturnValue(decodedToken);
      usersService.findById.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout(mockUser.id);

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        null,
      );
    });
  });
});
