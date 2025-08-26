import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/schemas/user.schema';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(private readonly usersService: UsersService) {}

  async seed(): Promise<void> {
    try {
      // Check if admin user already exists
      const adminUser = await this.usersService.findByEmail(
        'admin@inventory.com',
      );

      if (adminUser) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Create default admin user
      await this.usersService.create({
        name: 'Administrator',
        email: 'admin@inventory.com',
        password: 'Admin123!',
        role: UserRole.ADMIN,
        isActive: true,
      });

      this.logger.log('✅ Default admin user created successfully');
      this.logger.log('📧 Email: admin@inventory.com');
      this.logger.log('🔑 Password: Admin123!');
      this.logger.warn('⚠️  Please change the default password in production!');
    } catch (error) {
      this.logger.error('❌ Failed to create admin user:', error);
    }
  }
}
