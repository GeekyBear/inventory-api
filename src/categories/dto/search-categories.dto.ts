import {
    IsString,
    IsOptional,
    IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/common.dto';

export class SearchCategoriesDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'General text search across category name, description, and slug',
        example: 'electronics',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    q?: string; // General text search query

    @ApiPropertyOptional({
        description: 'Search by category name',
        example: 'Electronics',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name?: string; // Search by category name

    @ApiPropertyOptional({
        description: 'Search by category description',
        example: 'electronic devices',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    description?: string; // Search by description

    @ApiPropertyOptional({
        description: 'Search by category slug',
        example: 'electronics',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    slug?: string; // Search by slug

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
}
