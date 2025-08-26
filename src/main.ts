import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { validationPipeConfig } from './common/pipes/validation.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Rate limiting is now configured globally via APP_GUARD in AppModule

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(validationPipeConfig);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription(
      'A robust NestJS TypeScript microservice for inventory management with MongoDB integration, featuring advanced search capabilities and comprehensive CRUD operations for products and categories.',
    )
    .setVersion('1.0')
    .addTag('authentication', 'User authentication and authorization')
    .addTag('categories', 'Category management operations')
    .addTag('products', 'Product management operations')
    .addTag('search', 'Advanced search and filtering operations')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .setContact(
      'Ezequiel Sanchez',
      'https://github.com/GeekyBear/inventory-api',
      'your-email@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Inventory API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Inventory API is running on port ${port}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
