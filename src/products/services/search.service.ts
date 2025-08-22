import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  Category,
  CategoryDocument,
} from '../../categories/schemas/category.schema';
import { SearchProductsDto } from '../dto/search-products.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { PaginatedResult } from '../../common/interfaces/base.interface';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async searchProducts(
    searchDto: SearchProductsDto,
  ): Promise<PaginatedResult<ProductResponseDto>> {
    const {
      page = 1,
      limit = 10,
      sort = 'relevance',
      order = 'desc',
      q,
      name,
      description,
      brand,
      categoryId,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      tags,
      isActive = true,
      isFeatured,
      isLowStock,
      sku,
      specifications,
      sortBy,
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery: any = {};

    // Always filter by active status unless explicitly set to false
    if (isActive !== undefined) {
      searchQuery.isActive = isActive;
    }

    // Text search across multiple fields
    if (q) {
      searchQuery.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ];
    }

    // Specific field searches
    if (name) {
      searchQuery.name = { $regex: name, $options: 'i' };
    }

    if (description) {
      searchQuery.description = { $regex: description, $options: 'i' };
    }

    if (brand) {
      searchQuery.brand = { $regex: brand, $options: 'i' };
    }

    if (sku) {
      searchQuery.sku = { $regex: sku.toUpperCase(), $options: 'i' };
    }

    if (categoryId) {
      searchQuery.categoryId = categoryId;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) {
        searchQuery.price.$gte = minPrice;
      }
      if (maxPrice !== undefined) {
        searchQuery.price.$lte = maxPrice;
      }
    }

    // Quantity range filter
    if (minQuantity !== undefined || maxQuantity !== undefined) {
      searchQuery.quantity = {};
      if (minQuantity !== undefined) {
        searchQuery.quantity.$gte = minQuantity;
      }
      if (maxQuantity !== undefined) {
        searchQuery.quantity.$lte = maxQuantity;
      }
    }

    // Tags filter
    if (tags && tags.length > 0) {
      searchQuery.tags = { $in: tags.map((tag) => new RegExp(tag, 'i')) };
    }

    // Featured filter
    if (isFeatured !== undefined) {
      searchQuery.isFeatured = isFeatured;
    }

    // Low stock filter
    if (isLowStock !== undefined) {
      if (isLowStock) {
        searchQuery.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
      } else {
        searchQuery.$expr = { $gt: ['$quantity', '$lowStockThreshold'] };
      }
    }

    // Specifications search (search within JSON field)
    if (specifications) {
      // Create a regex to search within specifications values
      const specRegex = new RegExp(specifications, 'i');
      searchQuery.$or = searchQuery.$or || [];
      searchQuery.$or.push({
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $objectToArray: '$specifications' },
                  cond: {
                    $regexMatch: {
                      input: { $toString: '$$this.v' },
                      regex: specRegex,
                    },
                  },
                },
              },
            },
            0,
          ],
        },
      });
    }

    // Build sort object
    const sortField = sortBy || sort;
    let sortObj: Record<string, 1 | -1> = {};

    switch (sortField) {
      case 'relevance':
        // For relevance, we'll use a combination of factors
        if (q) {
          // If there's a text query, sort by text score and other factors
          sortObj = {
            score: { $meta: 'textScore' } as any,
            isFeatured: -1,
            createdAt: -1,
          };
        } else {
          // Default relevance without text search
          sortObj = { isFeatured: -1, createdAt: -1 };
        }
        break;
      case 'price':
        sortObj.price = order === 'asc' ? 1 : -1;
        break;
      case 'name':
        sortObj.name = order === 'asc' ? 1 : -1;
        break;
      case 'createdAt':
        sortObj.createdAt = order === 'asc' ? 1 : -1;
        break;
      case 'quantity':
        sortObj.quantity = order === 'asc' ? 1 : -1;
        break;
      default:
        sortObj.createdAt = order === 'asc' ? 1 : -1;
    }

    // Execute search with aggregation for better performance
    const aggregationPipeline: any[] = [
      { $match: searchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $addFields: {
          category: {
            $cond: {
              if: { $gt: [{ $size: '$category' }, 0] },
              then: { $arrayElemAt: ['$category', 0] },
              else: null,
            },
          },
          isLowStock: { $lte: ['$quantity', '$lowStockThreshold'] },
        },
      },
    ];

    // Add sorting
    if (sortField !== 'relevance' || !q) {
      aggregationPipeline.push({ $sort: sortObj });
    }

    // Get total count
    const countPipeline = [...aggregationPipeline, { $count: 'total' }];
    const countResult = await this.productModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination
    aggregationPipeline.push({ $skip: skip }, { $limit: limit });

    // Execute search
    const products = await this.productModel.aggregate(aggregationPipeline);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products.map(
        (product) => new ProductResponseDto(product, product.category),
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

  async getSearchSuggestions(
    query: string,
    limit: number = 10,
  ): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const suggestions = new Set<string>();

    // Get product name suggestions
    const nameMatches = await this.productModel
      .find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
      .select('name')
      .limit(limit)
      .lean();

    nameMatches.forEach((product) => suggestions.add(product.name));

    // Get brand suggestions
    const brandMatches = await this.productModel
      .find({
        brand: { $regex: query, $options: 'i' },
        isActive: true,
      })
      .select('brand')
      .limit(limit)
      .lean();

    brandMatches.forEach((product) => {
      if (product.brand) suggestions.add(product.brand);
    });

    // Get tag suggestions
    const tagMatches = await this.productModel
      .find({
        tags: { $in: [new RegExp(query, 'i')] },
        isActive: true,
      })
      .select('tags')
      .limit(limit)
      .lean();

    tagMatches.forEach((product) => {
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  async getSearchFilters(): Promise<{
    brands: string[];
    categories: { id: string; name: string }[];
    priceRange: { min: number; max: number };
    tags: string[];
  }> {
    // Get all unique brands
    const brands = await this.productModel.distinct('brand', {
      isActive: true,
      $and: [{ brand: { $ne: null } }, { brand: { $ne: '' } }],
    });

    // Get all active categories
    const categories = await this.categoryModel
      .find({ isActive: true })
      .select('_id name')
      .lean();

    // Get price range
    const priceStats = await this.productModel.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    const priceRange = priceStats[0] || { minPrice: 0, maxPrice: 0 };

    // Get all unique tags
    const tagResults = await this.productModel.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } },
    ]);

    const tags = tagResults.map((result) => result._id);

    return {
      brands: brands.sort(),
      categories: categories.map((cat) => ({
        id: cat._id.toString(),
        name: cat.name,
      })),
      priceRange: {
        min: priceRange.minPrice,
        max: priceRange.maxPrice,
      },
      tags: tags.sort(),
    };
  }
}
