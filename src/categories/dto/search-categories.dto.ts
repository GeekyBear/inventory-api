import {
    IsString,
    IsOptional,
    IsBoolean
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/common.dto';

export class SearchCategoriesDto extends PaginationDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    q?: string; // General text search query

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    name?: string; // Search by category name

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    description?: string; // Search by description

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    slug?: string; // Search by slug

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
