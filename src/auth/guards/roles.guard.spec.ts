import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../users/schemas/user.schema';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;

    it('should allow access when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('roles', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should allow access for ADMIN user when ADMIN role is required', () => {
      const mockRequest = {
        user: { role: UserRole.ADMIN },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for MANAGER user when MANAGER role is required', () => {
      const mockRequest = {
        user: { role: UserRole.MANAGER },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.MANAGER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for USER user when USER role is required', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access for USER when ADMIN role is required', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: admin',
      );
    });

    it('should deny access for USER when MANAGER role is required', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.MANAGER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: manager',
      );
    });

    it('should allow access for ADMIN user with any required role (hierarchy)', () => {
      const mockRequest = {
        user: { role: UserRole.ADMIN },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for MANAGER user when USER role is required (hierarchy)', () => {
      const mockRequest = {
        user: { role: UserRole.MANAGER },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const mockRequest = {
        user: { role: UserRole.MANAGER },
      };

      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.MANAGER,
      ]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user has none of multiple required roles', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue([
        UserRole.ADMIN,
        UserRole.MANAGER,
      ]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: admin, manager',
      );
    });

    it('should deny access when user is not present in request', () => {
      const mockRequest = {};

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'User not authenticated',
      );
    });

    it('should deny access when user role is not present', () => {
      const mockRequest = {
        user: { email: 'test@example.com' },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: user',
      );
    });

    it('should handle undefined required roles array', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue(null);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle empty required roles array', () => {
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      reflector.getAllAndOverride.mockReturnValue([]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle invalid user role gracefully', () => {
      const mockRequest = {
        user: { role: 'INVALID_ROLE' },
      };

      reflector.getAllAndOverride.mockReturnValue([UserRole.USER]);
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: user',
      );
    });
  });

  describe('Role Hierarchy', () => {
    const mockExecutionContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as unknown as ExecutionContext;

    it('should respect role hierarchy: ADMIN > MANAGER > USER', () => {
      const adminRequest = { user: { role: UserRole.ADMIN } };
      const managerRequest = { user: { role: UserRole.MANAGER } };
      const userRequest = { user: { role: UserRole.USER } };

      reflector.getAllAndOverride.mockReturnValue([UserRole.MANAGER]);

      // Admin should have access to MANAGER-required endpoint
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(adminRequest);
      expect(guard.canActivate(mockExecutionContext)).toBe(true);

      // Manager should have access to MANAGER-required endpoint
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(managerRequest);
      expect(guard.canActivate(mockExecutionContext)).toBe(true);

      // User should NOT have access to MANAGER-required endpoint
      (
        mockExecutionContext.switchToHttp().getRequest as jest.Mock
      ).mockReturnValue(userRequest);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        'Access denied. Required roles: manager',
      );
    });
  });
});
