import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-api',
  name: process.env.DATABASE_NAME || 'inventory-api',
}));
