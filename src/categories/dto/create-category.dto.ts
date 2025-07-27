import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(500)
    @Transform(({ value }) => value?.trim())
    description: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim().toLowerCase().replace(/\s+/g, '-'))
    slug?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}
