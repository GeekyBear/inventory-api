import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { EnvironmentVariables } from './environment.validation';

describe('Environment Validation', () => {
  describe('EnvironmentVariables', () => {
    it('should validate valid environment variables', async () => {
      const validEnv = {
        NODE_ENV: 'development',
        PORT: '3000',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        DATABASE_NAME: 'test-db',
      };

      const envInstance = plainToClass(EnvironmentVariables, validEnv);
      const errors = await validate(envInstance);

      expect(errors).toHaveLength(0);
    });

    it('should validate production environment', async () => {
      const prodEnv = {
        NODE_ENV: 'production',
        PORT: '8080',
        MONGODB_URI: 'mongodb://prod-host:27017/inventory',
        DATABASE_NAME: 'inventory-prod',
      };

      const envInstance = plainToClass(EnvironmentVariables, prodEnv);
      const errors = await validate(envInstance);

      expect(errors).toHaveLength(0);
    });

    it('should validate optional JWT settings', async () => {
      const envWithJWT = {
        MONGODB_URI: 'mongodb://localhost:27017/test',
        DATABASE_NAME: 'test-db',
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '7200',
      };

      const envInstance = plainToClass(EnvironmentVariables, envWithJWT);
      const errors = await validate(envInstance);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid PORT range', async () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        PORT: '999', // Below minimum
        MONGODB_URI: 'mongodb://localhost:27017/test',
        DATABASE_NAME: 'test-db',
      };

      const envInstance = plainToClass(EnvironmentVariables, invalidEnv);
      const errors = await validate(envInstance);

      expect(errors.length).toBeGreaterThan(0);
      const portError = errors.find((error) => error.property === 'PORT');
      expect(portError).toBeDefined();
    });

    it('should fail validation for missing required MONGODB_URI', async () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        PORT: '3000',
        DATABASE_NAME: 'test-db',
        // MONGODB_URI missing
      };

      const envInstance = plainToClass(EnvironmentVariables, invalidEnv);
      const errors = await validate(envInstance);

      expect(errors.length).toBeGreaterThan(0);
      const mongoError = errors.find(
        (error) => error.property === 'MONGODB_URI',
      );
      expect(mongoError).toBeDefined();
    });

    it('should fail validation for missing required DATABASE_NAME', async () => {
      const invalidEnv = {
        NODE_ENV: 'development',
        PORT: '3000',
        MONGODB_URI: 'mongodb://localhost:27017/test',
        // DATABASE_NAME missing
      };

      const envInstance = plainToClass(EnvironmentVariables, invalidEnv);
      const errors = await validate(envInstance);

      expect(errors.length).toBeGreaterThan(0);
      const dbNameError = errors.find(
        (error) => error.property === 'DATABASE_NAME',
      );
      expect(dbNameError).toBeDefined();
    });
  });
});
