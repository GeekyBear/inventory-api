import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SearchService } from './services/search.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { PaginationDto } from '../common/dto/common.dto';
import { ProductResponseDto } from './dto/product-response.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: ProductsService;
  let searchService: SearchService;

  const mockProductResponse: ProductResponseDto = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    sku: 'TEST-001',
    categoryId: '507f1f77bcf86cd799439012',
    category: {
      id: '507f1f77bcf86cd799439012',
      name: 'Test Category',
      description: 'Test Category Description',
      slug: 'test-category',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    brand: 'Test Brand',
    quantity: 10,
    lowStockThreshold: 5,
    tags: ['tag1', 'tag2'],
    images: ['https://example.com/image.jpg'],
    specifications: { color: 'black', weight: '1.5kg' },
    isActive: true,
    isFeatured: false,
    isLowStock: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResult = {
    data: [mockProductResponse],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCategory: jest.fn(),
    findLowStock: jest.fn(),
  };

  const mockSearchService = {
    searchProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get<ProductsService>(ProductsService);
    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description:
          'Test Description for the test product with enough characters',
        price: 99.99,
        sku: 'TEST-001',
        categoryId: '507f1f77bcf86cd799439012',
        brand: 'Test Brand',
        quantity: 10,
        lowStockThreshold: 5,
        tags: ['tag1', 'tag2'],
        images: ['https://example.com/image.jpg'],
        specifications: { color: 'black', weight: '1.5kg' },
        isFeatured: false,
      };

      mockProductsService.create.mockResolvedValue(mockProductResponse);

      const result = await controller.create(createProductDto);

      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Product created successfully');
      expect(result.data).toEqual(mockProductResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const queryDto: PaginationDto = { page: 1, limit: 10 };

      mockProductsService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(queryDto);

      expect(productsService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Products retrieved successfully');
      expect(result.data).toEqual(mockPaginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockProductsService.findOne.mockResolvedValue(mockProductResponse);

      const result = await controller.findOne(id);

      expect(productsService.findOne).toHaveBeenCalledWith(id);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Product retrieved successfully');
      expect(result.data).toEqual(mockProductResponse);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 199.99,
      };

      const updatedProduct = { ...mockProductResponse, ...updateProductDto };
      mockProductsService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(id, updateProductDto);

      expect(productsService.update).toHaveBeenCalledWith(id, updateProductDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Product updated successfully');
      expect(result.data).toEqual(updatedProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockProductsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(productsService.remove).toHaveBeenCalledWith(id);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Product deleted successfully');
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      const categoryId = '507f1f77bcf86cd799439012';
      const queryDto: PaginationDto = { page: 1, limit: 10 };

      mockProductsService.findByCategory.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findByCategory(categoryId, queryDto);

      expect(productsService.findByCategory).toHaveBeenCalledWith(
        categoryId,
        queryDto,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Products by category retrieved successfully',
      );
      expect(result.data).toEqual(mockPaginatedResult);
    });
  });

  describe('findLowStock', () => {
    it('should return low stock products', async () => {
      const queryDto: PaginationDto = { page: 1, limit: 10 };

      mockProductsService.findLowStock.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findLowStock(queryDto);

      expect(productsService.findLowStock).toHaveBeenCalledWith(queryDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Low stock products retrieved successfully');
      expect(result.data).toEqual(mockPaginatedResult);
    });
  });

  describe('searchProducts', () => {
    it('should search products with query', async () => {
      const searchDto: SearchProductsDto = {
        q: 'test',
        page: 1,
        limit: 10,
      };

      mockSearchService.searchProducts.mockResolvedValue(mockPaginatedResult);

      const result = await controller.searchProducts(searchDto);

      expect(searchService.searchProducts).toHaveBeenCalledWith(searchDto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Products search completed successfully');
      expect(result.data).toEqual(mockPaginatedResult);
    });
  });
});
