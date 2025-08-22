export class CategoryResponseDto {
  id: string;
  name: string;
  description: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(category: any) {
    this.id = category.id || category._id;
    this.name = category.name;
    this.description = category.description;
    this.slug = category.slug;
    this.isActive = category.isActive;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}
