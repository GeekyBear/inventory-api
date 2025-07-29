import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'The name of the category',
        example: 'Electronics',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    name: string;

    @ApiProperty({
        description: 'A detailed description of the category',
        example: 'Category for electronic devices and accessories',
        minLength: 10,
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    @Transform(({ value }) => value?.trim())
    description: string;

    @ApiPropertyOptional({
        description: 'URL-friendly slug for the category (auto-generated if not provided)',
        example: 'electronics',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-'))
    slug?: string;

    @ApiPropertyOptional({
        description: 'Whether the category is active',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}
