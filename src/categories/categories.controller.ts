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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SearchCategoriesDto } from './dto/search-categories.dto';
import { PaginationDto, ApiResponseDto } from '../common/dto/common.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new product category with the provided information',
  })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - category name already exists',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return ApiResponseDto.success('Category created successfully', category);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description:
      'Retrieves a paginated list of categories with optional search and filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll(
    @Query() queryDto: PaginationDto & Partial<SearchCategoriesDto>,
  ) {
    const result = await this.categoriesService.findAll(queryDto);
    return ApiResponseDto.success('Categories retrieved successfully', result);
  }

  @Get('search/suggestions')
  @ApiOperation({
    summary: 'Get category search suggestions',
    description:
      'Returns category suggestions based on search query for autocomplete functionality',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query',
    required: true,
    example: 'elec',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of suggestions',
    required: false,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Search suggestions retrieved successfully',
  })
  async getSearchSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const suggestions = await this.categoriesService.searchSuggestions(
      query,
      limit,
    );
    return ApiResponseDto.success(
      'Category search suggestions retrieved successfully',
      suggestions,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieves a category by its URL-friendly slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Category slug',
    example: 'electronics',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findBySlug(@Param('slug') slug: string) {
    const category = await this.categoriesService.findBySlug(slug);
    return ApiResponseDto.success('Category retrieved successfully', category);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a category by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '60f7b3b3b3f3f3f3f3f3f3f3',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne(id);
    return ApiResponseDto.success('Category retrieved successfully', category);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category with the provided information',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '60f7b3b3b3f3f3f3f3f3f3f3',
  })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return ApiResponseDto.success('Category updated successfully', category);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete category',
    description:
      'Marks a category as inactive (soft delete) - can be restored later',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '60f7b3b3b3f3f3f3f3f3f3f3',
  })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return ApiResponseDto.success('Category deleted successfully');
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete category',
    description:
      'Permanently removes a category from the database - cannot be restored',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '60f7b3b3b3f3f3f3f3f3f3f3',
  })
  @ApiResponse({
    status: 204,
    description: 'Category permanently deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async hardDelete(@Param('id') id: string) {
    await this.categoriesService.hardDelete(id);
    return ApiResponseDto.success('Category permanently deleted');
  }
}
