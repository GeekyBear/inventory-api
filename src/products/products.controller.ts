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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { SearchService } from './services/search.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { PaginationDto, ApiResponseDto } from '../common/dto/common.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly searchService: SearchService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product with the provided information',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid category',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - product SKU already exists',
  })
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return ApiResponseDto.success('Product created successfully', product);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieves a paginated list of products with optional filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() queryDto: PaginationDto & Partial<SearchProductsDto>) {
    const result = await this.productsService.findAll(queryDto);
    return ApiResponseDto.success('Products retrieved successfully', result);
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Get low stock products',
    description:
      'Retrieves products that have stock below their low stock threshold',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
  })
  async findLowStock(@Query() paginationDto: PaginationDto) {
    const result = await this.productsService.findLowStock(paginationDto);
    return ApiResponseDto.success(
      'Low stock products retrieved successfully',
      result,
    );
  }

  @Get('search')
  @ApiOperation({
    summary: 'Advanced product search',
    description:
      'Performs advanced search across products with multiple filters and sorting options',
  })
  @ApiResponse({
    status: 200,
    description: 'Products search completed successfully',
  })
  async searchProducts(@Query() searchDto: SearchProductsDto) {
    const result = await this.searchService.searchProducts(searchDto);
    return ApiResponseDto.success(
      'Products search completed successfully',
      result,
    );
  }

  @Get('search/suggestions')
  async getSearchSuggestions(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    const suggestions = await this.searchService.getSearchSuggestions(
      query,
      limit,
    );
    return ApiResponseDto.success(
      'Search suggestions retrieved successfully',
      suggestions,
    );
  }

  @Get('search/filters')
  async getSearchFilters() {
    const filters = await this.searchService.getSearchFilters();
    return ApiResponseDto.success(
      'Search filters retrieved successfully',
      filters,
    );
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    const product = await this.productsService.findBySku(sku);
    return ApiResponseDto.success('Product retrieved successfully', product);
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.productsService.findByCategory(
      categoryId,
      paginationDto,
    );
    return ApiResponseDto.success(
      'Products by category retrieved successfully',
      result,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return ApiResponseDto.success('Product retrieved successfully', product);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(id, updateProductDto);
    return ApiResponseDto.success('Product updated successfully', product);
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    const product = await this.productsService.updateStock(id, quantity);
    return ApiResponseDto.success(
      'Product stock updated successfully',
      product,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return ApiResponseDto.success('Product deleted successfully');
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    await this.productsService.hardDelete(id);
    return ApiResponseDto.success('Product permanently deleted');
  }
}
