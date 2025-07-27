import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SearchCategoriesDto } from './dto/search-categories.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { PaginationDto } from '../common/dto/common.dto';
import { PaginatedResult } from '../common/interfaces/base.interface';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
        try {
            // Generate slug if not provided
            const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

            const categoryData = {
                ...createCategoryDto,
                slug,
            };

            const createdCategory = new this.categoryModel(categoryData);
            const savedCategory = await createdCategory.save();

            return new CategoryResponseDto(savedCategory);
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Category name already exists');
            }
            throw error;
        }
    }

    async findAll(searchDto: PaginationDto & Partial<SearchCategoriesDto>): Promise<PaginatedResult<CategoryResponseDto>> {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc',
            q,
            name,
            description,
            slug,
            isActive = true
        } = searchDto;
        const skip = (page - 1) * limit;

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

        // Build search query
        const searchQuery: any = {};

        // Active status filter
        if (isActive !== undefined) {
            searchQuery.isActive = isActive;
        }

        // Text search across multiple fields
        if (q) {
            searchQuery.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { slug: { $regex: q, $options: 'i' } }
            ];
        }

        // Specific field searches
        if (name) {
            searchQuery.name = { $regex: name, $options: 'i' };
        }

        if (description) {
            searchQuery.description = { $regex: description, $options: 'i' };
        }

        if (slug) {
            searchQuery.slug = { $regex: slug, $options: 'i' };
        }

        const [categories, total] = await Promise.all([
            this.categoryModel
                .find(searchQuery)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.categoryModel.countDocuments(searchQuery),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: categories.map(category => new CategoryResponseDto(category)),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    async findOne(id: string): Promise<CategoryResponseDto> {
        const category = await this.categoryModel.findById(id).exec();

        if (!category || !category.isActive) {
            throw new NotFoundException('Category not found');
        }

        return new CategoryResponseDto(category);
    }

    async findBySlug(slug: string): Promise<CategoryResponseDto> {
        const category = await this.categoryModel.findOne({ slug, isActive: true }).exec();

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return new CategoryResponseDto(category);
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
        try {
            // Generate slug if name is being updated and no slug provided
            const updateData = { ...updateCategoryDto };
            if (updateCategoryDto.name && !updateCategoryDto.slug) {
                updateData.slug = this.generateSlug(updateCategoryDto.name);
            }

            const updatedCategory = await this.categoryModel
                .findByIdAndUpdate(id, updateData, { new: true })
                .exec();

            if (!updatedCategory) {
                throw new NotFoundException('Category not found');
            }

            return new CategoryResponseDto(updatedCategory);
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Category name already exists');
            }
            throw error;
        }
    }

    async remove(id: string): Promise<void> {
        // Soft delete - set isActive to false
        const result = await this.categoryModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        if (!result) {
            throw new NotFoundException('Category not found');
        }
    }

    async hardDelete(id: string): Promise<void> {
        const result = await this.categoryModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new NotFoundException('Category not found');
        }
    }

    async searchSuggestions(query: string, limit: number = 10): Promise<string[]> {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const suggestions = new Set<string>();

        // Get category name suggestions
        const nameMatches = await this.categoryModel
            .find({
                name: { $regex: query, $options: 'i' },
                isActive: true
            })
            .select('name')
            .limit(limit)
            .lean();

        nameMatches.forEach(category => suggestions.add(category.name));

        return Array.from(suggestions).slice(0, limit);
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
