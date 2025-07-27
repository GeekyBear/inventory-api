import {
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    IsBoolean,
    Min,
    Max,
    IsIn
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/common.dto';

export class SearchProductsDto extends PaginationDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    q?: string; // General text search query

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name?: string; // Search by product name

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    description?: string; // Search by description

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    brand?: string; // Filter by brand

    @IsOptional()
    @IsString()
    categoryId?: string; // Filter by category ID

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    minPrice?: number; // Minimum price filter

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    maxPrice?: number; // Maximum price filter

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minQuantity?: number; // Minimum quantity filter

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxQuantity?: number; // Maximum quantity filter

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(tag => tag.trim());
        }
        return Array.isArray(value) ? value : [];
    })
    tags?: string[]; // Filter by tags

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isActive?: boolean; // Filter by active status

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isFeatured?: boolean; // Filter by featured status

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    isLowStock?: boolean; // Filter by low stock status

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    sku?: string; // Search by SKU

    @IsOptional()
    @IsIn(['relevance', 'price', 'name', 'createdAt', 'quantity'])
    sortBy?: string; // Enhanced sort options

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    specifications?: string; // Search within specifications (JSON search)
}
