import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SearchCategoriesDto } from './dto/search-categories.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: any;

  const mockCategory = {
    _id: '64a7b8c9d1234567890abcde',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    slug: 'electronics',
    isActive: true,
    createdAt: new Date('2025-07-29T13:20:30.684Z'),
    updatedAt: new Date('2025-07-29T13:20:30.684Z'),
  };

  beforeEach(async () => {
    // Create a mock constructor function
    const MockModel: any = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest
        .fn()
        .mockResolvedValue({ ...data, _id: '64a7b8c9d1234567890abcde' }),
    }));

    // Create chainable query mock
    const createChainableMock = (resolveValue: any = null) => ({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(resolveValue),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(resolveValue),
    });

    // Attach static methods to the constructor
    MockModel.find = jest.fn().mockReturnValue(createChainableMock([]));
    MockModel.findById = jest.fn().mockReturnValue(createChainableMock(null));
    MockModel.findOne = jest.fn().mockReturnValue(createChainableMock(null));
    MockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue(createChainableMock(mockCategory));
    MockModel.countDocuments = jest.fn().mockResolvedValue(0);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get(getModelToken(Category.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category successfully', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      };

      const mockSavedCategory = { ...mockCategory };
      const mockSave = jest.fn().mockResolvedValue(mockSavedCategory);

      // Mock the constructor to return an object with save method
      model.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.create(createCategoryDto);

      expect(model).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createCategoryDto.name,
          description: createCategoryDto.description,
          slug: 'electronics',
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBeInstanceOf(CategoryResponseDto);
    });

    it('should throw ConflictException when category name already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
      };

      const mockSave = jest.fn().mockRejectedValue({ code: 11000 });
      model.mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated categories', async () => {
      const searchDto: SearchCategoriesDto = { page: 1, limit: 10 };
      const mockCategories = [mockCategory];

      model.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockCategories),
      });
      model.countDocuments.mockResolvedValue(1);

      const result = await service.findAll(searchDto);

      expect(model.find).toHaveBeenCalledWith({ isActive: true });
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
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await service.findOne('64a7b8c9d1234567890abcde');

      expect(model.findById).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
      expect(result).toBeInstanceOf(CategoryResponseDto);
    });

    it('should throw NotFoundException when category not found', async () => {
      model.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('64a7b8c9d1234567890abcde')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return a category by slug', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCategory),
      });

      const result = await service.findBySlug('electronics');

      expect(model.findOne).toHaveBeenCalledWith({
        slug: 'electronics',
        isActive: true,
      });
      expect(result).toBeInstanceOf(CategoryResponseDto);
    });

    it('should throw NotFoundException when category not found', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Electronics',
        description: 'Updated description',
      };

      const updatedCategory = {
        ...mockCategory,
        name: updateCategoryDto.name,
        description: updateCategoryDto.description,
      };

      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedCategory),
      });

      const result = await service.update(
        '64a7b8c9d1234567890abcde',
        updateCategoryDto,
      );

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcde',
        expect.objectContaining({
          name: updateCategoryDto.name,
          description: updateCategoryDto.description,
        }),
        { new: true },
      );
      expect(result).toBeInstanceOf(CategoryResponseDto);
    });

    it('should throw NotFoundException when category not found', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Electronics',
      };

      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update('64a7b8c9d1234567890abcde', updateCategoryDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a category successfully', async () => {
      const removedCategory = { ...mockCategory, isActive: false };

      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(removedCategory),
      });

      await service.remove('64a7b8c9d1234567890abcde');

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '64a7b8c9d1234567890abcde',
        { isActive: false },
        { new: true },
      );
    });
    it('should throw NotFoundException when category not found', async () => {
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove('64a7b8c9d1234567890abcde')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchSuggestions', () => {
    it('should return search suggestions', async () => {
      const mockSuggestions = [{ name: 'Electronics' }];

      model.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockSuggestions),
      });

      const result = await service.searchSuggestions('elec', 5);

      expect(model.find).toHaveBeenCalledWith({
        name: { $regex: 'elec', $options: 'i' },
        isActive: true,
      });
      expect(result).toEqual(['Electronics']);
    });

    it('should limit suggestions based on limit parameter', async () => {
      const mockSuggestions = [{ name: 'Electronics' }];

      model.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockSuggestions),
      });

      await service.searchSuggestions('elec', 3);

      expect(model.find().limit).toHaveBeenCalledWith(3);
    });
  });
});
