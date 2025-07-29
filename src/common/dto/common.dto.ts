import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Field to sort by',
        example: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sort?: string;

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
        default: 'desc',
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';
}

export class ApiResponseDto<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];

    constructor(success: boolean, message: string, data?: T, errors?: string[]) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    static success<T>(message: string, data?: T): ApiResponseDto<T> {
        return new ApiResponseDto(true, message, data);
    }

    static error(message: string, errors?: string[]): ApiResponseDto<null> {
        return new ApiResponseDto(false, message, null, errors);
    }
}
