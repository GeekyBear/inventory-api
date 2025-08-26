import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  private hasRequiredRole(
    userRole: UserRole,
    requiredRoles: UserRole[],
  ): boolean {
    // Role hierarchy: ADMIN > MANAGER > USER
    const roleHierarchy = {
      [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.USER],
      [UserRole.MANAGER]: [UserRole.MANAGER, UserRole.USER],
      [UserRole.USER]: [UserRole.USER],
    };

    const allowedRoles = roleHierarchy[userRole] || [];
    return requiredRoles.some((role) => allowedRoles.includes(role));
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = this.hasRequiredRole(user.role, requiredRoles);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
