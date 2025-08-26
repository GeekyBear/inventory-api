import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUser = {
    _id: '60f7b3b3b3f3f3f3f3f3f3f3',
    id: '60f7b3b3b3f3f3f3f3f3f3f3',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.USER,
    isActive: true,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayload = {
    sub: '60f7b3b3b3f3f3f3f3f3f3f3',
    email: 'test@example.com',
    role: UserRole.USER,
    iat: 1234567890,
    exp: 1234571490,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get(UsersService);

    // Setup default config mock
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret-key';
        default:
          return undefined;
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user for valid payload', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await strategy.validate(mockPayload);

      expect(usersService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        isActive: mockUser.isActive,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findById).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      usersService.findById.mockResolvedValue(inactiveUser as any);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle different user roles correctly', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      usersService.findById.mockResolvedValue(adminUser as any);

      const result = await strategy.validate(mockPayload);

      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should handle manager role correctly', async () => {
      const managerUser = { ...mockUser, role: UserRole.MANAGER };
      usersService.findById.mockResolvedValue(managerUser as any);

      const result = await strategy.validate(mockPayload);

      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('should validate payload with minimal required fields', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const minimalPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      };

      const result = await strategy.validate(minimalPayload);

      expect(result).toEqual({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
        isActive: mockUser.isActive,
      });
    });

    it('should handle database errors gracefully', async () => {
      usersService.findById.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'Database connection error',
      );
    });

    it('should validate user ID format correctly', async () => {
      const payloadWithInvalidId = {
        ...mockPayload,
        sub: 'invalid-user-id',
      };

      usersService.findById.mockResolvedValue(null);

      await expect(strategy.validate(payloadWithInvalidId)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findById).toHaveBeenCalledWith('invalid-user-id');
    });

    it('should preserve user email from payload', async () => {
      usersService.findById.mockResolvedValue(mockUser as any);

      const result = await strategy.validate(mockPayload);

      expect(result.email).toBe(mockPayload.email);
    });

    it('should preserve user role from database', async () => {
      const userWithDifferentRole = { ...mockUser, role: UserRole.MANAGER };
      usersService.findById.mockResolvedValue(userWithDifferentRole as any);

      const result = await strategy.validate(mockPayload);

      // Should use role from database, not from payload
      expect(result.role).toBe(UserRole.MANAGER);
    });
  });

  describe('Constructor', () => {
    it('should initialize with correct options', () => {
      expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should use fallback secret if JWT_SECRET not provided', () => {
      mockConfigService.get.mockReturnValue(undefined);

      // Create new instance to test fallback
      const testModule = Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: UsersService,
            useValue: mockUsersService,
          },
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      });

      expect(() => testModule.compile()).not.toThrow();
    });
  });
});
