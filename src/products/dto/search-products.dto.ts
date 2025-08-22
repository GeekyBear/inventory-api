import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/common.dto';

export class SearchProductsDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'General text search across product name, description, brand, SKU, and tags',
    example: 'macbook pro',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  q?: string; // General text search query

  @ApiPropertyOptional({
    description: 'Search by product name',
    example: 'MacBook Pro',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string; // Search by product name

  @ApiPropertyOptional({
    description: 'Search by product description',
    example: 'high-performance laptop',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string; // Search by description

  @ApiPropertyOptional({
    description: 'Filter by product brand',
    example: 'Apple',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  brand?: string; // Filter by brand

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '60f7b3b3b3f3f3f3f3f3f3f3',
  })
  @IsOptional()
  @IsString()
  categoryId?: string; // Filter by category ID

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 100.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  minPrice?: number; // Minimum price filter

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 5000.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  maxPrice?: number; // Maximum price filter

  @ApiPropertyOptional({
    description: 'Minimum stock quantity filter',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQuantity?: number; // Minimum quantity filter

  @ApiPropertyOptional({
    description: 'Maximum stock quantity filter',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxQuantity?: number; // Maximum quantity filter

  @ApiPropertyOptional({
    description: 'Filter by product tags (comma-separated)',
    example: 'laptop,professional,high-performance',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag) => tag.trim());
    }
    return Array.isArray(value) ? value : [];
  })
  tags?: string[]; // Filter by tags

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isActive?: boolean; // Filter by active status

  @ApiPropertyOptional({
    description: 'Filter by featured status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isFeatured?: boolean; // Filter by featured status

  @ApiPropertyOptional({
    description: 'Filter products with low stock',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isLowStock?: boolean; // Filter by low stock status

  @ApiPropertyOptional({
    description: 'Search by product SKU',
    example: 'MBP16-M2-512',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  sku?: string; // Search by SKU

  @ApiPropertyOptional({
    description: 'Sort results by specific field',
    example: 'relevance',
    enum: ['relevance', 'price', 'name', 'createdAt', 'quantity'],
  })
  @IsOptional()
  @IsIn(['relevance', 'price', 'name', 'createdAt', 'quantity'])
  sortBy?: string; // Enhanced sort options

  @ApiPropertyOptional({
    description: 'Search within product specifications (JSON search)',
    example: 'M2 Pro',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  specifications?: string; // Search within specifications (JSON search)
}
