// E2E Test Setup
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  // Any global setup can go here
  await Promise.resolve();
  console.log('🧪 Starting E2E tests...');
});

afterAll(async () => {
  // Any global cleanup can go here
  await Promise.resolve();
  console.log('✅ E2E tests completed');
});
