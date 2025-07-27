import { IsOptional, IsNumber, Min, IsString, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sort?: string;

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
