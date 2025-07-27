import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SearchCategoriesDto } from './dto/search-categories.dto';
import { PaginationDto, ApiResponseDto } from '../common/dto/common.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCategoryDto: CreateCategoryDto) {
        const category = await this.categoriesService.create(createCategoryDto);
        return ApiResponseDto.success('Category created successfully', category);
    }

    @Get()
    async findAll(@Query() queryDto: PaginationDto & Partial<SearchCategoriesDto>) {
        const result = await this.categoriesService.findAll(queryDto);
        return ApiResponseDto.success('Categories retrieved successfully', result);
    }

    @Get('search/suggestions')
    async getSearchSuggestions(
        @Query('q') query: string,
        @Query('limit') limit?: number,
    ) {
        const suggestions = await this.categoriesService.searchSuggestions(query, limit);
        return ApiResponseDto.success('Category search suggestions retrieved successfully', suggestions);
    }

    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        const category = await this.categoriesService.findBySlug(slug);
        return ApiResponseDto.success('Category retrieved successfully', category);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const category = await this.categoriesService.findOne(id);
        return ApiResponseDto.success('Category retrieved successfully', category);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ) {
        const category = await this.categoriesService.update(id, updateCategoryDto);
        return ApiResponseDto.success('Category updated successfully', category);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.categoriesService.remove(id);
        return ApiResponseDto.success('Category deleted successfully');
    }

    @Delete(':id/hard')
    @HttpCode(HttpStatus.NO_CONTENT)
    async hardDelete(@Param('id') id: string) {
        await this.categoriesService.hardDelete(id);
        return ApiResponseDto.success('Category permanently deleted');
    }
}
