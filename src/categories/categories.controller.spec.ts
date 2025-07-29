import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesController', () => {
    let controller: CategoriesController;
    let service: CategoriesService;

    const mockCategory = {
        id: '64a7b8c9d1234567890abcde',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        slug: 'electronics',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockCategoriesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findBySlug: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        hardDelete: jest.fn(),
        searchSuggestions: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriesController],
            providers: [
                {
                    provide: CategoriesService,
                    useValue: mockCategoriesService,
                },
            ],
        }).compile();

        controller = module.get<CategoriesController>(CategoriesController);
        service = module.get<CategoriesService>(CategoriesService);
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

            mockCategoriesService.create.mockResolvedValue(mockCategory);

            const result = await controller.create(createCategoryDto);

            expect(service.create).toHaveBeenCalledWith(createCategoryDto);
            expect(result).toEqual({
                success: true,
                message: 'Category created successfully',
                data: mockCategory,
            });
        });

        it('should handle ConflictException from service', async () => {
            const createCategoryDto: CreateCategoryDto = {
                name: 'Electronics',
                description: 'Electronic devices and accessories',
            };

            mockCategoriesService.create.mockRejectedValue(
                new ConflictException('Category name already exists')
            );

            await expect(controller.create(createCategoryDto)).rejects.toThrow(ConflictException);
            expect(service.create).toHaveBeenCalledWith(createCategoryDto);
        });
    });

    describe('findAll', () => {
        it('should return paginated categories', async () => {
            const queryDto = { page: 1, limit: 10 };
            const mockResult = {
                data: [mockCategory],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 10,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockCategoriesService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(queryDto);

            expect(service.findAll).toHaveBeenCalledWith(queryDto);
            expect(result).toEqual({
                success: true,
                message: 'Categories retrieved successfully',
                data: mockResult,
            });
        });

        it('should handle search parameters', async () => {
            const queryDto = { page: 1, limit: 10, q: 'electronics' };
            const mockResult = {
                data: [mockCategory],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: 10,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };

            mockCategoriesService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(queryDto);

            expect(service.findAll).toHaveBeenCalledWith(queryDto);
            expect(result.success).toBe(true);
        });
    });

    describe('findOne', () => {
        it('should return a category by id', async () => {
            mockCategoriesService.findOne.mockResolvedValue(mockCategory);

            const result = await controller.findOne('64a7b8c9d1234567890abcde');

            expect(service.findOne).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
            expect(result).toEqual({
                success: true,
                message: 'Category retrieved successfully',
                data: mockCategory,
            });
        });

        it('should handle NotFoundException from service', async () => {
            mockCategoriesService.findOne.mockRejectedValue(
                new NotFoundException('Category not found')
            );

            await expect(controller.findOne('64a7b8c9d1234567890abcde')).rejects.toThrow(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
        });
    });

    describe('findBySlug', () => {
        it('should return a category by slug', async () => {
            mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

            const result = await controller.findBySlug('electronics');

            expect(service.findBySlug).toHaveBeenCalledWith('electronics');
            expect(result).toEqual({
                success: true,
                message: 'Category retrieved successfully',
                data: mockCategory,
            });
        });

        it('should handle NotFoundException from service', async () => {
            mockCategoriesService.findBySlug.mockRejectedValue(
                new NotFoundException('Category not found')
            );

            await expect(controller.findBySlug('nonexistent')).rejects.toThrow(NotFoundException);
            expect(service.findBySlug).toHaveBeenCalledWith('nonexistent');
        });
    });

    describe('update', () => {
        it('should update a category successfully', async () => {
            const updateCategoryDto: UpdateCategoryDto = {
                name: 'Updated Electronics',
                description: 'Updated description',
            };

            const updatedCategory = { ...mockCategory, ...updateCategoryDto };
            mockCategoriesService.update.mockResolvedValue(updatedCategory);

            const result = await controller.update('64a7b8c9d1234567890abcde', updateCategoryDto);

            expect(service.update).toHaveBeenCalledWith('64a7b8c9d1234567890abcde', updateCategoryDto);
            expect(result).toEqual({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory,
            });
        });

        it('should handle NotFoundException from service', async () => {
            const updateCategoryDto: UpdateCategoryDto = {
                name: 'Updated Electronics',
            };

            mockCategoriesService.update.mockRejectedValue(
                new NotFoundException('Category not found')
            );

            await expect(controller.update('64a7b8c9d1234567890abcde', updateCategoryDto))
                .rejects.toThrow(NotFoundException);
            expect(service.update).toHaveBeenCalledWith('64a7b8c9d1234567890abcde', updateCategoryDto);
        });
    });

    describe('remove', () => {
        it('should soft delete a category successfully', async () => {
            mockCategoriesService.remove.mockResolvedValue(undefined);

            const result = await controller.remove('64a7b8c9d1234567890abcde');

            expect(service.remove).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
            expect(result).toEqual({
                success: true,
                message: 'Category deleted successfully',
            });
        });

        it('should handle NotFoundException from service', async () => {
            mockCategoriesService.remove.mockRejectedValue(
                new NotFoundException('Category not found')
            );

            await expect(controller.remove('64a7b8c9d1234567890abcde')).rejects.toThrow(NotFoundException);
            expect(service.remove).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
        });
    });

    describe('hardDelete', () => {
        it('should permanently delete a category successfully', async () => {
            mockCategoriesService.hardDelete.mockResolvedValue(undefined);

            const result = await controller.hardDelete('64a7b8c9d1234567890abcde');

            expect(service.hardDelete).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
            expect(result).toEqual({
                success: true,
                message: 'Category permanently deleted',
            });
        });

        it('should handle NotFoundException from service', async () => {
            mockCategoriesService.hardDelete.mockRejectedValue(
                new NotFoundException('Category not found')
            );

            await expect(controller.hardDelete('64a7b8c9d1234567890abcde')).rejects.toThrow(NotFoundException);
            expect(service.hardDelete).toHaveBeenCalledWith('64a7b8c9d1234567890abcde');
        });
    });

    describe('getSearchSuggestions', () => {
        it('should return search suggestions', async () => {
            const mockSuggestions = ['Electronics', 'Electronic Accessories'];
            mockCategoriesService.searchSuggestions.mockResolvedValue(mockSuggestions);

            const result = await controller.getSearchSuggestions('elec', 5);

            expect(service.searchSuggestions).toHaveBeenCalledWith('elec', 5);
            expect(result).toEqual({
                success: true,
                message: 'Category search suggestions retrieved successfully',
                data: mockSuggestions,
            });
        });

        it('should use default limit when not provided', async () => {
            const mockSuggestions = ['Electronics'];
            mockCategoriesService.searchSuggestions.mockResolvedValue(mockSuggestions);

            const result = await controller.getSearchSuggestions('elec');

            expect(service.searchSuggestions).toHaveBeenCalledWith('elec', undefined);
            expect(result.success).toBe(true);
        });
    });
});
