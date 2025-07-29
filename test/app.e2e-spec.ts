import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CategoriesModule } from '../src/categories/categories.module';
import { ProductsModule } from '../src/products/products.module';
import { TestDatabaseHelper } from '../src/test/test-utils';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Inventory API (e2e)', () => {
  let app: INestApplication<App>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async () => ({
            uri: await TestDatabaseHelper.startDatabase(),
          }),
        }),
        CategoriesModule,
        ProductsModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Apply same middleware as main app
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api/v1');

    await app.init();
  }, 120000); // 2 minute timeout for setup

  afterAll(async () => {
    await TestDatabaseHelper.closeDatabase();
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    await TestDatabaseHelper.clearDatabase(moduleRef);
  });

  describe('Categories API', () => {
    describe('POST /api/v1/categories', () => {
      it('should create a new category', () => {
        const createCategoryDto = {
          name: 'Electronics',
          description: 'Electronic devices and accessories',
        };

        return request(app.getHttpServer())
          .post('/api/v1/categories')
          .send(createCategoryDto)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Category created successfully');
            expect(res.body.data).toMatchObject({
              name: 'Electronics',
              description: 'Electronic devices and accessories',
              slug: 'electronics',
              isActive: true,
            });
            expect(res.body.data.id).toBeDefined();
          });
      });

      it('should return 400 for invalid data', () => {
        const invalidData = {
          name: 'A', // Too short
          description: 'Short', // Too short
        };

        return request(app.getHttpServer())
          .post('/api/v1/categories')
          .send(invalidData)
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
          });
      });
    });

    describe('GET /api/v1/categories', () => {
      beforeEach(async () => {
        // Create test categories
        await request(app.getHttpServer())
          .post('/api/v1/categories')
          .send({
            name: 'Electronics',
            description: 'Electronic devices and accessories',
          });

        await request(app.getHttpServer())
          .post('/api/v1/categories')
          .send({
            name: 'Books',
            description: 'Books and publications',
          });
      });

      it('should return paginated categories', () => {
        return request(app.getHttpServer())
          .get('/api/v1/categories')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('pagination');
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(2);
          });
      });

      it('should filter categories by search query', () => {
        return request(app.getHttpServer())
          .get('/api/v1/categories?q=electronics')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(1);
            expect(res.body.data.data[0].name).toBe('Electronics');
          });
      });

      it('should handle pagination parameters', () => {
        return request(app.getHttpServer())
          .get('/api/v1/categories?page=1&limit=1')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data.length).toBe(1);
            expect(res.body.data.pagination.page).toBe(1);
            expect(res.body.data.pagination.limit).toBe(1);
          });
      });
    });
  });

  describe('Products API', () => {
    let categoryId: string;

    beforeEach(async () => {
      // Create a test category first
      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'Electronics',
          description: 'Electronic devices and accessories',
        });

      categoryId = categoryResponse.body.data.id;
    });

    describe('POST /api/v1/products', () => {
      it('should create a new product', () => {
        const createProductDto = {
          name: 'MacBook Pro 16-inch',
          description: 'High-performance laptop with M2 chip, 16GB RAM, and 512GB SSD',
          price: 2499.99,
          sku: 'MBP16-M2-512',
          quantity: 25,
          categoryId: categoryId,
          brand: 'Apple',
          tags: ['laptop', 'professional'],
        };

        return request(app.getHttpServer())
          .post('/api/v1/products')
          .send(createProductDto)
          .expect(201)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Product created successfully');
            expect(res.body.data).toMatchObject({
              name: 'MacBook Pro 16-inch',
              price: 2499.99,
              sku: 'MBP16-M2-512',
              quantity: 25,
              brand: 'Apple',
              isActive: true,
              isFeatured: false,
            });
          });
      });

      it('should return 400 for invalid category', () => {
        const createProductDto = {
          name: 'MacBook Pro',
          description: 'High-performance laptop',
          price: 2499.99,
          sku: 'MBP16',
          quantity: 25,
          categoryId: '64a7b8c9d1234567890abcde', // Non-existent category
        };

        return request(app.getHttpServer())
          .post('/api/v1/products')
          .send(createProductDto)
          .expect(400)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('Invalid category ID');
          });
      });

      it('should return 409 for duplicate SKU', async () => {
        const createProductDto = {
          name: 'MacBook Pro 16-inch',
          description: 'High-performance laptop',
          price: 2499.99,
          sku: 'MBP16-M2-512',
          quantity: 25,
          categoryId: categoryId,
        };

        // Create first product
        await request(app.getHttpServer())
          .post('/api/v1/products')
          .send(createProductDto)
          .expect(201);

        // Try to create duplicate
        return request(app.getHttpServer())
          .post('/api/v1/products')
          .send(createProductDto)
          .expect(409)
          .expect((res) => {
            expect(res.body.success).toBe(false);
            expect(res.body.message).toContain('SKU already exists');
          });
      });
    });

    describe('GET /api/v1/products', () => {
      beforeEach(async () => {
        // Create test products
        const products = [
          {
            name: 'MacBook Pro 16-inch',
            description: 'High-performance laptop',
            price: 2499.99,
            sku: 'MBP16-M2-512',
            quantity: 25,
            categoryId: categoryId,
            brand: 'Apple',
            isFeatured: true,
          },
          {
            name: 'MacBook Air',
            description: 'Lightweight laptop',
            price: 1299.99,
            sku: 'MBA-M2-256',
            quantity: 15,
            categoryId: categoryId,
            brand: 'Apple',
            isFeatured: false,
          },
        ];

        for (const product of products) {
          await request(app.getHttpServer())
            .post('/api/v1/products')
            .send(product);
        }
      });

      it('should return paginated products', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('pagination');
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(2);
          });
      });

      it('should filter products by brand', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products?brand=Apple')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(2);
            expect(res.body.data.data.every((p: any) => p.brand === 'Apple')).toBe(true);
          });
      });

      it('should filter products by featured status', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products?isFeatured=true')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(1);
            expect(res.body.data.data[0].isFeatured).toBe(true);
          });
      });
    });

    describe('GET /api/v1/products/search', () => {
      beforeEach(async () => {
        // Create test products for search
        const products = [
          {
            name: 'MacBook Pro 16-inch',
            description: 'High-performance laptop with M2 chip',
            price: 2499.99,
            sku: 'MBP16-M2-512',
            quantity: 25,
            categoryId: categoryId,
            brand: 'Apple',
            tags: ['laptop', 'professional', 'high-performance'],
          },
          {
            name: 'iPad Pro',
            description: 'Professional tablet with M2 chip',
            price: 1099.99,
            sku: 'IPAD-PRO-M2',
            quantity: 30,
            categoryId: categoryId,
            brand: 'Apple',
            tags: ['tablet', 'professional'],
          },
        ];

        for (const product of products) {
          await request(app.getHttpServer())
            .post('/api/v1/products')
            .send(product);
        }
      });

      it('should search products by general query', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products/search?q=macbook')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(1);
            expect(res.body.data.data[0].name).toContain('MacBook');
          });
      });

      it('should search products by price range', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products/search?minPrice=1000&maxPrice=1500')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(1);
            expect(res.body.data.data[0].price).toBeLessThanOrEqual(1500);
            expect(res.body.data.data[0].price).toBeGreaterThanOrEqual(1000);
          });
      });

      it('should search products by tags', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products/search?tags=professional')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(2);
          });
      });

      it('should sort products by price', () => {
        return request(app.getHttpServer())
          .get('/api/v1/products/search?sortBy=price&order=asc')
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.data.length).toBe(2);
            expect(res.body.data.data[0].price).toBeLessThan(res.body.data.data[1].price);
          });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should create category, create product, and search', async () => {
      // Create category
      const categoryResponse = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'Smartphones',
          description: 'Mobile phones and accessories',
        })
        .expect(201);

      const categoryId = categoryResponse.body.data.id;

      // Create product
      const productResponse = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced features',
          price: 999.99,
          sku: 'IPHONE15PRO',
          quantity: 50,
          categoryId: categoryId,
          brand: 'Apple',
          tags: ['smartphone', 'premium'],
        })
        .expect(201);

      const productId = productResponse.body.data.id;

      // Search for the product
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/products/search?q=iPhone')
        .expect(200);

      expect(searchResponse.body.data.data).toBeInstanceOf(Array);
      expect(searchResponse.body.data.data.length).toBe(1);
      expect(searchResponse.body.data.data[0].id).toBe(productId);

      // Get product by category
      const categoryProductsResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/category/${categoryId}`)
        .expect(200);

      expect(categoryProductsResponse.body.data.data).toBeInstanceOf(Array);
      expect(categoryProductsResponse.body.data.data.length).toBe(1);
      expect(categoryProductsResponse.body.data.data[0].id).toBe(productId);
    });

    it('should handle complex search scenarios', async () => {
      // Create multiple categories and products
      const electronicsCategory = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'Electronics',
          description: 'Electronic devices',
        });

      const booksCategory = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'Books',
          description: 'Books and publications',
        });

      // Create products in different categories
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Programming Book',
          description: 'Learn JavaScript programming',
          price: 49.99,
          sku: 'BOOK-JS-001',
          quantity: 100,
          categoryId: booksCategory.body.data.id,
          tags: ['programming', 'javascript'],
        });

      await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'JavaScript Course',
          description: 'Online JavaScript course',
          price: 99.99,
          sku: 'COURSE-JS-001',
          quantity: 1000,
          categoryId: electronicsCategory.body.data.id,
          tags: ['programming', 'javascript', 'online'],
        });

      // Search across all products
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/products/search?q=javascript')
        .expect(200);

      expect(searchResponse.body.data.data).toBeInstanceOf(Array);
      expect(searchResponse.body.data.data.length).toBe(2);

      // Search with price filter
      const priceFilterResponse = await request(app.getHttpServer())
        .get('/api/v1/products/search?q=javascript&minPrice=50')
        .expect(200);

      expect(priceFilterResponse.body.data.data).toBeInstanceOf(Array);
      expect(priceFilterResponse.body.data.data.length).toBe(1);
      expect(priceFilterResponse.body.data.data[0].name).toBe('JavaScript Course');
    });
  });
});
