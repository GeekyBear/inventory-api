import databaseConfig from './database.config';

describe('Database Config', () => {
  it('should return MongoDB URI from environment', () => {
    process.env.MONGODB_URI = 'mongodb://test-host:27017/test-db';
    process.env.DATABASE_NAME = 'test-inventory';

    const config = databaseConfig();

    expect(config.uri).toBe('mongodb://test-host:27017/test-db');
    expect(config.name).toBe('test-inventory');
  });

  it('should use default values when environment variables are not set', () => {
    delete process.env.MONGODB_URI;
    delete process.env.DATABASE_NAME;

    const config = databaseConfig();

    expect(config.uri).toBe('mongodb://localhost:27017/inventory-api');
    expect(config.name).toBe('inventory-api');
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.MONGODB_URI;
    delete process.env.DATABASE_NAME;
  });
});
