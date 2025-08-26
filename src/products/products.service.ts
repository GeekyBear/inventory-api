import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { PaginationDto } from '../common/dto/common.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { PaginatedResult } from '../common/interfaces/base.interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      // Validate category exists
      const category = await this.categoryModel
        .findById(createProductDto.categoryId)
        .exec();
      if (!category || !category.isActive) {
        throw new BadRequestException('Invalid category ID');
      }

      const createdProduct = new this.productModel(createProductDto);
      const savedProduct = await createdProduct.save();

      return new ProductResponseDto(savedProduct, category);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Product SKU already exists');
      }
      throw error;
    }
  }

  async findAll(
    paginationDto: PaginationDto & Partial<SearchProductsDto>,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      brand,
      isFeatured,
      minPrice,
      maxPrice,
      categoryId,
    } = paginationDto;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

    // Build filter query
    const filterQuery: any = { isActive: true };

    // Add filters if provided
    if (brand) {
      filterQuery.brand = { $regex: brand, $options: 'i' };
    }

    if (isFeatured !== undefined) {
      filterQuery.isFeatured = isFeatured;
    }

    if (categoryId) {
      filterQuery.categoryId = categoryId;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filterQuery.price = {};
      if (minPrice !== undefined) {
        filterQuery.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        filterQuery.price.$lte = maxPrice;
      }
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filterQuery)
        .populate('categoryId')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filterQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) => new ProductResponseDto(product, product.categoryId),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId')
      .exec();

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return new ProductResponseDto(product, product.categoryId);
  }

  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.productModel
      .findOne({ sku: sku.toUpperCase(), isActive: true })
      .populate('categoryId')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return new ProductResponseDto(product, product.categoryId);
  }

  async findByCategory(
    categoryId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

    // Validate category exists
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category || !category.isActive) {
      throw new BadRequestException('Invalid category ID');
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find({ categoryId, isActive: true })
        .populate('categoryId')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments({ categoryId, isActive: true }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) => new ProductResponseDto(product, product.categoryId),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findLowStock(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = 'quantity',
      order = 'asc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

    const [products, total] = await Promise.all([
      this.productModel
        .find({
          isActive: true,
          $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
        })
        .populate('categoryId')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments({
        isActive: true,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) => new ProductResponseDto(product, product.categoryId),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    try {
      // Validate category if being updated
      if (updateProductDto.categoryId) {
        const category = await this.categoryModel
          .findById(updateProductDto.categoryId)
          .exec();
        if (!category || !category.isActive) {
          throw new BadRequestException('Invalid category ID');
        }
      }

      const updatedProduct = await this.productModel
        .findByIdAndUpdate(id, updateProductDto, { new: true })
        .populate('categoryId')
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }

      return new ProductResponseDto(updatedProduct, updatedProduct.categoryId);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Product SKU already exists');
      }
      throw error;
    }
  }

  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, { quantity }, { new: true })
      .populate('categoryId')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return new ProductResponseDto(updatedProduct, updatedProduct.categoryId);
  }

  async remove(id: string): Promise<void> {
    // Soft delete - set isActive to false
    const result = await this.productModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Product not found');
    }
  }
}
