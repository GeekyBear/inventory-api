import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockConnection: any;

  beforeEach(async () => {
    mockConnection = {
      readyState: 1, // connected by default
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.npm_package_version;
  });

  describe('check', () => {
    it('should return health status with connected database', () => {
      mockConnection.readyState = 1; // connected
      process.env.npm_package_version = '1.2.3';

      const result = controller.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        database: 'connected',
        version: '1.2.3',
      });

      // Validate timestamp format
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      expect(result.uptime).toBeGreaterThan(0);
    });

    it('should return health status with disconnected database', () => {
      mockConnection.readyState = 0; // disconnected

      const result = controller.check();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        database: 'disconnected',
        version: '1.0.0', // default version
      });
    });

    it('should return health status with connecting database', () => {
      mockConnection.readyState = 2; // connecting

      const result = controller.check();

      expect(result.database).toBe('connecting');
    });

    it('should return health status with disconnecting database', () => {
      mockConnection.readyState = 3; // disconnecting

      const result = controller.check();

      expect(result.database).toBe('disconnecting');
    });

    it('should return unknown for invalid database state', () => {
      mockConnection.readyState = 99 as any; // invalid state

      const result = controller.check();

      expect(result.database).toBe('unknown');
    });

    it('should use default version when npm_package_version is not set', () => {
      const result = controller.check();

      expect(result.version).toBe('1.0.0');
    });
  });

  describe('ready', () => {
    it('should return ready status when database is connected', () => {
      mockConnection.readyState = 1; // connected

      const result = controller.ready();

      expect(result).toEqual({
        status: 'ready',
        timestamp: expect.any(String),
      });

      // Validate timestamp format
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should throw error when database is disconnected', () => {
      mockConnection.readyState = 0; // disconnected

      expect(() => controller.ready()).toThrow('Database not connected');
    });

    it('should throw error when database is connecting', () => {
      mockConnection.readyState = 2; // connecting

      expect(() => controller.ready()).toThrow('Database not connected');
    });

    it('should throw error when database is disconnecting', () => {
      mockConnection.readyState = 3; // disconnecting

      expect(() => controller.ready()).toThrow('Database not connected');
    });
  });

  describe('live', () => {
    it('should return alive status', () => {
      const result = controller.live();

      expect(result).toEqual({
        status: 'alive',
        timestamp: expect.any(String),
      });

      // Validate timestamp format
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return alive status regardless of database state', () => {
      mockConnection.readyState = 0; // disconnected

      const result = controller.live();

      expect(result.status).toBe('alive');
    });
  });

  describe('integration', () => {
    it('should handle all connection states correctly', () => {
      const states = [
        { state: 0, expected: 'disconnected' },
        { state: 1, expected: 'connected' },
        { state: 2, expected: 'connecting' },
        { state: 3, expected: 'disconnecting' },
      ];

      states.forEach(({ state, expected }) => {
        mockConnection.readyState = state;
        const result = controller.check();
        expect(result.database).toBe(expected);
      });
    });

    it('should maintain consistent timestamp format across endpoints', () => {
      const healthResult = controller.check();
      const readyResult = controller.ready();
      const liveResult = controller.live();

      // All timestamps should be valid ISO strings
      expect(() => new Date(healthResult.timestamp)).not.toThrow();
      expect(() => new Date(readyResult.timestamp)).not.toThrow();
      expect(() => new Date(liveResult.timestamp)).not.toThrow();

      // Timestamps should be very close (within 1 second)
      const healthTime = new Date(healthResult.timestamp).getTime();
      const readyTime = new Date(readyResult.timestamp).getTime();
      const liveTime = new Date(liveResult.timestamp).getTime();

      expect(Math.abs(healthTime - readyTime)).toBeLessThan(1000);
      expect(Math.abs(healthTime - liveTime)).toBeLessThan(1000);
    });
  });
});
