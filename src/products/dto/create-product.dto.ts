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

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(200)
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(1000)
    @Transform(({ value }) => value?.trim())
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(999999.99)
    @Type(() => Number)
    price: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    @Transform(({ value }) => value?.trim().toUpperCase())
    sku: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    quantity: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    lowStockThreshold?: number = 5;

    @IsMongoId()
    categoryId: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    brand?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value.map((tag: string) => tag.trim()) : [])
    tags?: string[] = [];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[] = [];

    @IsOptional()
    @IsObject()
    specifications?: Record<string, any> = {};

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean = false;
}
