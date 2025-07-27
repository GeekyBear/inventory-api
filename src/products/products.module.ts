import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsService } from './products.service';
import { SearchService } from './services/search.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from './schemas/product.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Product.name, schema: ProductSchema },
            { name: Category.name, schema: CategorySchema },
        ]),
    ],
    controllers: [ProductsController],
    providers: [ProductsService, SearchService],
    exports: [ProductsService, SearchService],
})
export class ProductsModule { }
