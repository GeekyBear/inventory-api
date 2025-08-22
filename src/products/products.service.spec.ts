import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';
import { Category } from '../categories/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { PaginationDto } from '../common/dto/common.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let categoryModel: any;

  const mockCategory = {
    _id: '64a7b8c9d1234567890abcde',
    name: 'Electronics',
    slug: 'electronics',
  };

  const mockProduct = {
    _id: '64a7b8c9d1234567890abcdf',
    name: 'Smartphone',
    description: 'High-end smartphone',
    sku: 'PHONE-001',
    price: 999.99,
    stockQuantity: 50,
    minStockLevel: 10,
    category: '64a7b8c9d1234567890abcde',
    isActive: true,
    createdAt: new Date('2025-07-29T13:20:30.684Z'),
    updatedAt: new Date('2025-07-29T13:20:30.684Z'),
  };

  beforeEach(async () => {
    // Create mock constructor functions
    const MockProductModel: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest
        .fn()
        .mockResolvedValue({ ...data, _id: '64a7b8c9d1234567890abcdf' }),
    }));

    const MockCategoryModel: any = jest.fn();

    // Create chainable query mock
    const createChainableMock = (resolveValue: any = null) => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(resolveValue),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(resolveValue),
    });

    // Attach static methods to the constructors
    MockProductModel.find = jest.fn().mockReturnValue(createChainableMock([]));
    MockProductModel.findById = jest
      .fn()
      .mockReturnValue(createChainableMock(null));
    MockProductModel.findOne = jest
      .fn()
      .mockReturnValue(createChainableMock(null));
    MockProductModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue(createChainableMock(mockProduct));
    MockProductModel.countDocuments = jest.fn().mockResolvedValue(0);

    MockCategoryModel.findById = jest
      .fn()
      .mockReturnValue(createChainableMock(null));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: MockProductModel,
        },
        {
          provide: getModelToken(Category.name),
          useValue: MockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get(getModelToken(Product.name));
    categoryModel = module.get(getModelToken(Category.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Smartphone',
        description: 'High-end smartphone',
        sku: 'PHONE-001',
        price: 999.99,
        quantity: 50,
        lowStockThreshold: 10,
        categoryId: '64a7b8c9d1234567890abcde',
      };

      const mockSavedProduct = { ...mockProduct };
      const mockSave = jest.fn().mockResolvedValue(mockSavedProduct);

      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockCategory, isActive: true }),
      });

      productModel.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.create(createProductDto);

      expect(categoryModel.findById).toHaveBeenCalledWith(
        createProductDto.categoryId,
      );
      expect(productModel).toHaveBeenCalledWith(createProductDto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ProductResponseDto);
    });

    it('should throw ConflictException when SKU already exists', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Smartphone',
        description: 'High-end smartphone',
        sku: 'PHONE-001',
        price: 999.99,
        quantity: 50,
        lowStockThreshold: 10,
        categoryId: '64a7b8c9d1234567890abcde',
      };

      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockCategory, isActive: true }),
      });

      const mockSave = jest.fn().mockRejectedValue({ code: 11000 });
      productModel.mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(service.create(createProductDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Smartphone',
        description: 'High-end smartphone',
        sku: 'PHONE-001',
        price: 999.99,
        quantity: 50,
        lowStockThreshold: 10,
        categoryId: '64a7b8c9d1234567890abcde',
      };

      categoryModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const searchDto: SearchProductsDto = { page: 1, limit: 10 };
      const mockProducts = [mockProduct];

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      });
      productModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(searchDto);

      expect(productModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual({
        data: expect.any(Array),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should filter by category when provided', async () => {
      const searchDto: SearchProductsDto = {
        page: 1,
        limit: 10,
        categoryId: '64a7b8c9d1234567890abcde',
      };

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      productModel.countDocuments.mockResolvedValue(0);

      await service.findAll(searchDto);

      expect(productModel.find).toHaveBeenCalledWith({
        isActive: true,
        categoryId: '64a7b8c9d1234567890abcde',
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      productModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProduct),
      });

      const result = await service.findOne('64a7b8c9d1234567890abcdf');

      expect(productModel.findById).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcdf',
      );
      expect(result).toBeInstanceOf(ProductResponseDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      productModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('64a7b8c9d1234567890abcdf')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Smartphone',
        price: 1099.99,
      };

      const updatedProduct = {
        ...mockProduct,
        name: updateProductDto.name,
        price: updateProductDto.price,
      };

      productModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedProduct),
      });

      const result = await service.update(
        '64a7b8c9d1234567890abcdf',
        updateProductDto,
      );

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcdf',
        updateProductDto,
        { new: true },
      );
      expect(result).toBeInstanceOf(ProductResponseDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Smartphone',
      };

      productModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('64a7b8c9d1234567890abcdf', updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update product stock successfully', async () => {
      const updatedProduct = {
        ...mockProduct,
        stockQuantity: 45,
      };

      productModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedProduct),
      });

      const result = await service.updateStock('64a7b8c9d1234567890abcdf', 45);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcdf',
        { quantity: 45 },
        { new: true },
      );
      expect(result).toBeInstanceOf(ProductResponseDto);
    });

    it('should throw NotFoundException when product not found', async () => {
      productModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateStock('64a7b8c9d1234567890abcdf', 45),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a product successfully', async () => {
      const removedProduct = { ...mockProduct, isActive: false };

      productModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(removedProduct),
      });

      await service.remove('64a7b8c9d1234567890abcdf');

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcdf',
        { isActive: false },
        { new: true },
      );
    });
    it('should throw NotFoundException when product not found', async () => {
      productModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('64a7b8c9d1234567890abcdf')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findLowStock', () => {
    it('should return products with low stock', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const lowStockProducts = [mockProduct];

      productModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(lowStockProducts),
      });
      productModel.countDocuments.mockResolvedValue(1);

      const result = await service.findLowStock(paginationDto);

      expect(productModel.find).toHaveBeenCalledWith({
        isActive: true,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      });
      expect(result).toEqual({
        data: expect.any(Array),
        pagination: expect.any(Object),
      });
    });
  });
});
