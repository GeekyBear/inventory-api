import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { Product } from '../schemas/product.schema';
import { Category } from '../../categories/schemas/category.schema';
import { SearchProductsDto } from '../dto/search-products.dto';
import { ProductResponseDto } from '../dto/product-response.dto';

describe('SearchService', () => {
    let service: SearchService;
    let productModel: any;
    let categoryModel: any;

    const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        sku: 'TEST-001',
        categoryId: '507f1f77bcf86cd799439012',
        brand: 'Test Brand',
        quantity: 10,
        lowStockThreshold: 5,
        tags: ['tag1', 'tag2'],
        images: ['https://example.com/image.jpg'],
        specifications: { color: 'black' },
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockCategory = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Category',
        description: 'Test Category Description',
        slug: 'test-category',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const createMockQuery = () => ({
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockProduct]),
        countDocuments: jest.fn().mockResolvedValue(1),
    });

    beforeEach(async () => {
        const mockProductModel = {
            find: jest.fn(() => createMockQuery()),
            countDocuments: jest.fn().mockResolvedValue(1),
            aggregate: jest.fn().mockImplementation((pipeline) => {
                // Check if this is the count aggregation
                const hasCountStage = pipeline.some((stage: any) => stage.$count);
                if (hasCountStage) {
                    return Promise.resolve([{ total: 1 }]);
                }
                // Return products for the main aggregation
                return Promise.resolve([mockProduct]);
            }),
        };

        const mockCategoryModel = {
            find: jest.fn(() => createMockQuery()),
            findOne: jest.fn(() => ({
                exec: jest.fn().mockResolvedValue(mockCategory),
            })),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                {
                    provide: getModelToken(Product.name),
                    useValue: mockProductModel,
                },
                {
                    provide: getModelToken(Category.name),
                    useValue: mockCategoryModel,
                },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        productModel = module.get(getModelToken(Product.name));
        categoryModel = module.get(getModelToken(Category.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('searchProducts', () => {
        it('should search products with basic query', async () => {
            const searchDto: SearchProductsDto = {
                q: 'test',
                page: 1,
                limit: 10,
            };

            // Mock the aggregate pipeline calls
            productModel.aggregate.mockImplementation((pipeline) => {
                // Check if this is the count aggregation by looking for $count stage
                const hasCountStage = pipeline.some((stage: any) => stage.$count);
                if (hasCountStage) {
                    return Promise.resolve([{ total: 1 }]);
                }
                // Return products for the main aggregation
                return Promise.resolve([mockProduct]);
            });

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalledTimes(2); // Once for count, once for data
            expect(result.data).toHaveLength(1);
            expect(result.pagination.total).toBe(1);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should search products with name filter', async () => {
            const searchDto: SearchProductsDto = {
                name: 'Test',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with price range', async () => {
            const searchDto: SearchProductsDto = {
                minPrice: 50,
                maxPrice: 150,
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with brand filter', async () => {
            const searchDto: SearchProductsDto = {
                brand: 'Test Brand',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with category filter', async () => {
            const searchDto: SearchProductsDto = {
                categoryId: '507f1f77bcf86cd799439012',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with tags filter', async () => {
            const searchDto: SearchProductsDto = {
                tags: ['tag1', 'tag2'],
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with isActive filter', async () => {
            const searchDto: SearchProductsDto = {
                isActive: true,
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with isFeatured filter', async () => {
            const searchDto: SearchProductsDto = {
                isFeatured: true,
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with isLowStock filter', async () => {
            const searchDto: SearchProductsDto = {
                isLowStock: true,
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with quantity range', async () => {
            const searchDto: SearchProductsDto = {
                minQuantity: 5,
                maxQuantity: 20,
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with SKU filter', async () => {
            const searchDto: SearchProductsDto = {
                sku: 'TEST-001',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should search products with specifications filter', async () => {
            const searchDto: SearchProductsDto = {
                specifications: 'color',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should handle empty search results', async () => {
            const searchDto: SearchProductsDto = {
                q: 'nonexistent',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([]);

            const result = await service.searchProducts(searchDto);

            expect(result.data).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle different sort options', async () => {
            const searchDto: SearchProductsDto = {
                sort: 'price',
                order: 'asc',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });

        it('should handle sortBy parameter', async () => {
            const searchDto: SearchProductsDto = {
                sortBy: 'name',
                order: 'desc',
                page: 1,
                limit: 10,
            };

            productModel.aggregate.mockResolvedValue([mockProduct]);

            const result = await service.searchProducts(searchDto);

            expect(productModel.aggregate).toHaveBeenCalled();
            expect(result.data).toHaveLength(1);
        });
    });
});
