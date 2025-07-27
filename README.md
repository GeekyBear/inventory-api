# Inventory Management API

A robust NestJS TypeScript microservice for inventory management with MongoDB integration, featuring advanced search capabilities and comprehensive CRUD operations for products and categories.

## 🚀 Features

- **Product Management**: Complete CRUD operations with advanced filtering
- **Category Management**: Hierarchical category system with soft delete
- **Advanced Search**: MongoDB aggregation-powered search with multiple filters
- **Search Suggestions**: Intelligent autocomplete for products and categories
- **Low Stock Monitoring**: Automatic low stock threshold tracking
- **Data Validation**: Comprehensive input validation with class-validator
- **Error Handling**: Centralized exception handling with detailed error responses
- **API Documentation**: Complete Postman collection for testing

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: class-validator, class-transformer
- **Configuration**: @nestjs/config
- **Testing**: Postman collection included

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd inventory-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/inventory-api
   DATABASE_NAME=inventory-api

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your system or configure MongoDB Atlas connection.

## 🚦 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Watch Mode

```bash
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Categories

| Method | Endpoint                         | Description                        |
| ------ | -------------------------------- | ---------------------------------- |
| GET    | `/categories`                    | Get all categories with pagination |
| GET    | `/categories/:id`                | Get category by ID                 |
| GET    | `/categories/slug/:slug`         | Get category by slug               |
| POST   | `/categories`                    | Create new category                |
| PATCH  | `/categories/:id`                | Update category                    |
| DELETE | `/categories/:id`                | Soft delete category               |
| DELETE | `/categories/:id/hard`           | Permanently delete category        |
| GET    | `/categories/search/suggestions` | Get category search suggestions    |

### Products

| Method | Endpoint                         | Description                      |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/products`                      | Get all products with pagination |
| GET    | `/products/:id`                  | Get product by ID                |
| GET    | `/products/sku/:sku`             | Get product by SKU               |
| GET    | `/products/category/:categoryId` | Get products by category         |
| GET    | `/products/low-stock`            | Get low stock products           |
| POST   | `/products`                      | Create new product               |
| PATCH  | `/products/:id`                  | Update product                   |
| PATCH  | `/products/:id/stock`            | Update product stock             |
| DELETE | `/products/:id`                  | Soft delete product              |
| DELETE | `/products/:id/hard`             | Permanently delete product       |

### Search & Filters

| Method | Endpoint                       | Description                  |
| ------ | ------------------------------ | ---------------------------- |
| GET    | `/products/search`             | Advanced product search      |
| GET    | `/products/search/suggestions` | Get search suggestions       |
| GET    | `/products/search/filters`     | Get available search filters |

## 🔍 Advanced Search Features

### Product Search Parameters

- **q**: General text search across name, description, brand, SKU, and tags
- **name**: Search by product name
- **brand**: Filter by brand
- **categoryId**: Filter by category
- **minPrice/maxPrice**: Price range filter
- **minQuantity/maxQuantity**: Stock quantity filter
- **tags**: Filter by tags (comma-separated)
- **isActive**: Filter by active status
- **isFeatured**: Filter by featured status
- **isLowStock**: Filter by low stock status
- **specifications**: Search within product specifications
- **sortBy**: Sort by relevance, price, name, createdAt, quantity
- **order**: Sort order (asc/desc)
- **page/limit**: Pagination parameters

### Example Search Queries

```bash
# General text search
GET /products/search?q=macbook&page=1&limit=5

# Price range filter
GET /products/search?minPrice=500&maxPrice=2000&sortBy=price&order=asc

# Brand and category filter
GET /products/search?brand=Apple&categoryId=60f7b3b3b3f3f3f3f3f3f3f3

# Tags filter
GET /products/search?tags=laptop,professional&sortBy=name
```

## 📊 Data Models

### Product Schema

```typescript
{
  name: string;           // Required, 2-200 chars
  description: string;    // Required, 10-1000 chars
  price: number;          // Required, min 0, max 999999.99
  sku: string;            // Required, unique, auto-uppercase
  quantity: number;       // Required, min 0
  lowStockThreshold: number; // Default: 5
  categoryId: ObjectId;   // Required, references Category
  brand?: string;         // Optional, max 100 chars
  tags: string[];         // Array of tags
  images: string[];       // Array of image URLs
  specifications: object; // Flexible JSON object
  isActive: boolean;      // Default: true
  isFeatured: boolean;    // Default: false
  createdAt: Date;        // Auto-generated
  updatedAt: Date;        // Auto-generated
}
```

### Category Schema

```typescript
{
  name: string; // Required, unique, 2-100 chars
  description: string; // Required, 10-500 chars
  slug: string; // Auto-generated from name
  isActive: boolean; // Default: true
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

## 🧪 Testing

### Using Postman

1. Import the Postman collection from `/postman/Inventory-API.postman_collection.json`
2. The collection includes:
   - All API endpoints
   - Environment variables
   - Automated tests
   - Workflow examples

### Test Categories

- **Category Management**: CRUD operations and search
- **Product Management**: CRUD operations with validation
- **Advanced Search**: All search variations and filters
- **Error Handling**: Invalid data and edge cases

## 🏗️ Project Structure

```
src/
├── categories/
│   ├── dto/                 # Data Transfer Objects
│   ├── schemas/             # MongoDB schemas
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── products/
│   ├── dto/
│   ├── schemas/
│   ├── services/
│   │   └── search.service.ts # Advanced search logic
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── common/
│   ├── dto/                 # Common DTOs
│   ├── filters/             # Exception filters
│   ├── interfaces/          # Base interfaces
│   └── pipes/               # Validation pipes
├── config/
│   └── database.config.ts   # Database configuration
└── main.ts                  # Application entry point
```

## 🚀 Deployment

### Using Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-api
DATABASE_NAME=inventory-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `dev`: Development integration branch
- `feature/*`: Feature development branches

### Code Style

- Use TypeScript interfaces and DTOs
- Follow NestJS best practices
- Implement proper error handling
- Use environment variables for configuration
- Write descriptive commit messages

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure database permissions

2. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Review data type constraints

3. **Search Returns Empty Results**
   - Verify products have `isActive: true`
   - Check category associations
   - Review search parameters

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ezequiel Sanchez**

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Alondra, my wife, for enduring my coding marathons

---

For more information or support, please open an issue in the repository.
