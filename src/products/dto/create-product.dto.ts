import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsArray,
    IsMongoId,
    IsObject,
    MaxLength,
    MinLength,
    Min,
    Max
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        example: 'MacBook Pro 16-inch',
        minLength: 2,
        maxLength: 200,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(200)
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty({
        description: 'Detailed description of the product',
        example: 'High-performance laptop with M2 chip, 16GB RAM, and 512GB SSD',
        minLength: 10,
        maxLength: 1000,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(1000)
    @Transform(({ value }) => value?.trim())
    description: string;

    @ApiProperty({
        description: 'Product price in USD',
        example: 2499.99,
        minimum: 0,
        maximum: 999999.99,
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(999999.99)
    @Type(() => Number)
    price: number;

    @ApiProperty({
        description: 'Unique product SKU (automatically converted to uppercase)',
        example: 'MBP16-M2-512',
        maxLength: 50,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Transform(({ value }) => value?.trim().toUpperCase())
    sku: string;

    @ApiProperty({
        description: 'Current stock quantity',
        example: 25,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;

    @ApiPropertyOptional({
        description: 'Low stock alert threshold',
        example: 5,
        minimum: 0,
        default: 5,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    lowStockThreshold?: number = 5;

    @ApiProperty({
        description: 'Category ID that this product belongs to',
        example: '60f7b3b3b3f3f3f3f3f3f3f3',
    })
    @IsMongoId()
    categoryId: string;

    @ApiPropertyOptional({
        description: 'Product brand',
        example: 'Apple',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    brand?: string;

    @ApiPropertyOptional({
        description: 'Product tags for categorization and search',
        example: ['laptop', 'professional', 'high-performance'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map((tag: string) => tag.trim()) : [])
    tags?: string[] = [];

    @ApiPropertyOptional({
        description: 'Array of product image URLs',
        example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[] = [];

    @ApiPropertyOptional({
        description: 'Product specifications as key-value pairs',
        example: {
            'CPU': 'M2 Pro',
            'RAM': '16GB',
            'Storage': '512GB SSD',
            'Display': '16.2-inch Liquid Retina XDR'
        },
    })
    @IsOptional()
    @IsObject()
    specifications?: Record<string, any> = {};

    @ApiPropertyOptional({
        description: 'Whether the product is active and available',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Whether the product is featured',
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean = false;
}
