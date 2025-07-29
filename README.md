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
- **API Documentation**: Interactive Swagger/OpenAPI documentation + Postman collection
- **Comprehensive Testing**: 70%+ test coverage with unit, integration, and E2E tests
- **Cross-Platform Support**: Works seamlessly on Windows, macOS, and Linux

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest, Supertest (Unit, Integration, E2E)
- **Configuration**: @nestjs/config
- **API Testing**: Postman collection included

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## ⚡ Quick Start

Get the API running in under 5 minutes:

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd inventory-api
   npm install
   ```

2. **Setup Environment**
   ```bash
   # Create .env file
   echo "MONGODB_URI=mongodb://localhost:27017/inventory-api" > .env
   echo "DATABASE_NAME=inventory-api" >> .env
   echo "PORT=3000" >> .env
   ```

3. **Start Development Server**
   ```bash
   npm run start:dev
   ```

4. **Access Documentation**
   - API Docs: http://localhost:3000/api
   - Test Endpoints: Import `/postman/Inventory-API.postman_collection.json`

5. **Run Tests**
   ```bash
   npm run test:cov
   ```

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

## 🛠️ Available Scripts

This project includes cross-platform scripts that work on Windows, macOS, and Linux:

```bash
# Development
npm run start:dev      # Start in development mode with hot reload
npm run start:debug    # Start in debug mode with debugging enabled
npm run build          # Build the application for production
npm run start:prod     # Start the built application in production mode

# Testing
npm test              # Run unit and integration tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage report
npm run test:e2e      # Run end-to-end tests

# Code Quality
npm run lint          # Run ESLint to check code quality
npm run format        # Format code with Prettier (if configured)
```

## 📖 API Documentation

### Interactive Swagger Documentation

Once the application is running, access the interactive API documentation at:

**http://localhost:3000/api**

The Swagger interface provides:
- Complete API endpoint documentation
- Interactive request/response examples
- Schema definitions for all DTOs
- Try-it-out functionality for testing endpoints
- Authentication examples (if applicable)

### Alternative Documentation

You can also use the Postman collection located at `/postman/Inventory-API.postman_collection.json` for comprehensive API testing.

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

### Test Coverage

This project maintains **70%+ test coverage** with comprehensive test suites:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

### Test Structure

- **Unit Tests**: Individual service and utility function testing
- **Controller Tests**: HTTP endpoint testing with mocked dependencies
- **Integration Tests**: Database integration and service interaction testing
- **E2E Tests**: Full application workflow testing

### Coverage Report

Current test coverage includes:
- **Controllers**: 100% coverage for all endpoints
- **Services**: Comprehensive business logic testing
- **Error Handling**: Exception filters and validation testing
- **Search Functionality**: Advanced search and aggregation testing

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
│   ├── categories.module.ts
│   └── categories.controller.spec.ts  # Controller tests
├── products/
│   ├── dto/
│   ├── schemas/
│   ├── services/
│   │   ├── search.service.ts # Advanced search logic
│   │   └── search.service.spec.ts # Search service tests
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   ├── products.controller.spec.ts # Controller tests
│   └── products.service.spec.ts    # Service tests
├── common/
│   ├── dto/                 # Common DTOs
│   ├── filters/             # Exception filters
│   │   ├── all-exceptions.filter.ts
│   │   └── all-exceptions.filter.spec.ts # Filter tests
│   ├── interfaces/          # Base interfaces
│   └── pipes/               # Validation pipes
├── config/
│   └── database.config.ts   # Database configuration
├── database/
│   └── seeds/              # Database seeding
├── app.controller.ts
├── app.service.ts
├── app.module.ts
├── app.controller.spec.ts  # App controller tests
└── main.ts                 # Application entry point
test/
├── app.e2e-spec.ts        # End-to-end tests
└── jest-e2e.json         # E2E test configuration
postman/
└── Inventory-API.postman_collection.json # API collection
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

- Use TypeScript interfaces and DTOs for type safety
- Follow NestJS best practices with modules, controllers, and services
- Implement proper error handling and validation
- Use MongoDB schemas with Mongoose ODM
- Follow RESTful API conventions
- Implement proper logging and monitoring
- Write comprehensive tests for new features
- Maintain Swagger documentation for API changes
- Use environment variables for configuration
- Write descriptive commit messages

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure database permissions

2. **Validation Errors**
   - Check request body format against Swagger documentation
   - Verify required fields are provided
   - Review data type constraints in DTOs

3. **Search Returns Empty Results**
   - Verify products have `isActive: true`
   - Check category associations
   - Review search parameters in Swagger docs

4. **Tests Failing**
   - Run `npm test` to see detailed error messages
   - Check if MongoDB test database is accessible
   - Verify all dependencies are installed with `npm install`

5. **Swagger Documentation Not Loading**
   - Ensure application is running on correct port
   - Check that `/api` endpoint is accessible
   - Verify Swagger setup in `main.ts`

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ezequiel Sanchez**

## 🙏 Acknowledgments

- NestJS team for the amazing framework and comprehensive documentation
- MongoDB team for the powerful database and aggregation framework
- Jest community for the excellent testing framework
- Swagger/OpenAPI for standardized API documentation
- The open source community for continuous inspiration
- Alondra, my wife, for enduring my coding marathons and providing endless support

---

For more information or support, please open an issue in the repository.
