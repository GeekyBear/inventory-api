import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  categoryId: string;
  category?: CategoryResponseDto;
  brand?: string;
  tags: string[];
  images: string[];
  specifications: Record<string, any>;
  isActive: boolean;
  isFeatured: boolean;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(product: any, category?: any) {
    this.id = product.id || product._id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.sku = product.sku;
    this.quantity = product.quantity;
    this.lowStockThreshold = product.lowStockThreshold;
    this.categoryId = product.categoryId;
    this.brand = product.brand;
    this.tags = product.tags || [];
    this.images = product.images || [];
    this.specifications = product.specifications || {};
    this.isActive = product.isActive;
    this.isFeatured = product.isFeatured;
    this.isLowStock = product.quantity <= product.lowStockThreshold;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;

    // Include category information if provided
    if (category) {
      this.category = new CategoryResponseDto(category);
    }
  }
}
