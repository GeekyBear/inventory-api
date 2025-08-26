import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from '../users/schemas/user.schema';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  const mockUser = {
    _id: '60f7b3b3b3f3f3f3f3f3f3f3',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse: AuthResponseDto = {
    accessToken: 'mock_access_token',
    refreshToken: 'mock_refresh_token',
    user: {
      id: '60f7b3b3b3f3f3f3f3f3f3f3',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.USER,
      isActive: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw ConflictException if user already exists', async () => {
      authService.register.mockRejectedValue(
        new ConflictException(
          'User with email test@example.com already exists',
        ),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should validate required fields', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle inactive user login attempt', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Account is deactivated'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'valid_refresh_token',
    };

    it('should refresh tokens successfully', async () => {
      authService.refreshTokens.mockResolvedValue(mockAuthResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      authService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      authService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Refresh token expired'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    const mockRequest = {
      user: { id: mockUser._id },
    };

    it('should logout user successfully', async () => {
      authService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest.user as any);

      expect(authService.logout).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual({
        message: 'Successfully logged out',
      });
    });

    it('should handle logout for non-existent user', async () => {
      authService.logout.mockRejectedValue(
        new UnauthorizedException('User not found'),
      );

      await expect(controller.logout(mockRequest.user as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: {
        id: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
      },
    };

    it('should return user profile successfully', async () => {
      const result = await controller.getProfile(mockRequest.user as any);

      expect(result).toEqual(mockRequest.user);
    });

    it('should handle missing user in request', async () => {
      const result = await controller.getProfile(undefined as any);

      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors correctly', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        'Database connection error',
      );
    });
  });

  describe('Input Validation', () => {
    it('should handle malformed email in register', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };

      authService.register.mockResolvedValue(mockAuthResponse);

      // The validation would be handled by class-validator before reaching controller
      // We test that the service is called with whatever passes validation
      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should handle empty refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: '',
      };

      authService.refreshTokens.mockRejectedValue(
        new UnauthorizedException('Refresh token is required'),
      );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
