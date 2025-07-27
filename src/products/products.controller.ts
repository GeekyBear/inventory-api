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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto, ApiResponseDto } from '../common/dto/common.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProductDto: CreateProductDto) {
        const product = await this.productsService.create(createProductDto);
        return ApiResponseDto.success('Product created successfully', product);
    }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto) {
        const result = await this.productsService.findAll(paginationDto);
        return ApiResponseDto.success('Products retrieved successfully', result);
    }

    @Get('low-stock')
    async findLowStock(@Query() paginationDto: PaginationDto) {
        const result = await this.productsService.findLowStock(paginationDto);
        return ApiResponseDto.success('Low stock products retrieved successfully', result);
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
        const result = await this.productsService.findByCategory(categoryId, paginationDto);
        return ApiResponseDto.success('Products by category retrieved successfully', result);
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
        return ApiResponseDto.success('Product stock updated successfully', product);
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
