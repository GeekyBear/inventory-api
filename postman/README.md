# Postman Collection Documentation - Inventory API

## Overview

This Postman collection provides complete testing capabilities for the Inventory Management API, including authentication, CRUD operations, search functionality, and comprehensive workflow tests.

## 🚀 Features

- **JWT Authentication System** with automatic token refresh
- **Complete CRUD Operations** for categories and products
- **Advanced Search & Filtering** capabilities
- **End-to-End Workflow Testing** scenarios
- **Automated Test Validation** with comprehensive assertions
- **Environment Variables** for seamless testing

## 📁 Collection Structure

### 1. Authentication

Complete user authentication flow with JWT token management:

- **Register User** - Create new user accounts
- **Login User** - Authenticate existing users
- **Refresh Token** - Renew expired access tokens
- **Get Profile** - Retrieve user profile information
- **Logout** - Terminate user sessions

### 2. Categories Management

Full CRUD operations for inventory categories:

- **Create Category** - Add new product categories
- **Get All Categories** - List all available categories
- **Get Category by ID** - Retrieve specific category details
- **Update Category** - Modify existing categories
- **Search Categories** - Find categories by name/criteria
- **Delete Category** - Remove categories from system

### 3. Products Management

Comprehensive product inventory operations:

- **Create Product** - Add new products to inventory
- **Get All Products** - List products with pagination
- **Get Product by ID** - Retrieve specific product details
- **Update Product** - Modify product information
- **Delete Product** - Remove products from inventory

### 4. Search & Filters

Advanced search capabilities with multiple filter options:

- **Search Products** - Text-based product search
- **Filter by Category** - Products within specific categories
- **Filter by Price Range** - Products within price bounds
- **Filter by Stock Status** - In-stock/out-of-stock filtering
- **Advanced Combined Search** - Multi-criteria filtering

### 5. Complete Workflow Tests

End-to-end testing scenarios that simulate real-world usage:

- **User Registration & Login Flow** - Complete onboarding process
- **Setup Initial Categories** - Category creation workflow
- **Add Multiple Products** - Product inventory setup
- **Search and Filter Products** - Search functionality validation
- **Update Product Inventory** - Inventory management operations
- **Verify User Profile & Session** - Session management testing
- **Cleanup - Logout User** - Proper session termination

## 🔧 Setup Instructions

### Prerequisites

1. **Postman** installed (latest version recommended)
2. **Inventory API** running locally on port 3000
3. **MongoDB** database connected and running

### Import Collection

1. Open Postman
2. Click "Import" button
3. Select the `Inventory-API.postman_collection.json` file
4. Collection will be imported with all requests and tests

### Environment Setup

The collection uses the following variables (automatically managed):

#### Base Configuration

- `base_url`: http://localhost:3000 (API base URL)

#### Authentication Variables (Auto-managed)

- `access_token`: JWT access token for API authentication
- `refresh_token`: JWT refresh token for token renewal
- `token_expiry`: Token expiration timestamp
- `user_id`: Current authenticated user ID

#### Test Data Variables (Auto-managed)

- `category_id`: ID of created test category
- `product_id`: ID of created test product

#### Workflow Variables (Auto-managed)

- `workflow_access_token`: Separate token for workflow tests
- `workflow_refresh_token`: Refresh token for workflow tests
- `workflow_user_id`: User ID for workflow testing
- `workflow_category_id`: Category ID for workflow tests
- `workflow_product_ids`: Array of product IDs
- `workflow_first_product_id`: First product ID for testing

## 🧪 Testing Features

### Automatic Token Management

The collection includes intelligent token management:

- **Auto-refresh**: Tokens are automatically renewed before expiration
- **Session tracking**: User sessions are properly maintained
- **Error handling**: Invalid tokens trigger re-authentication

### Comprehensive Test Assertions

Each request includes multiple test validations:

- **HTTP Status Codes**: Verify correct response status
- **Response Structure**: Validate JSON response format
- **Data Integrity**: Check required fields and data types
- **Business Logic**: Verify application-specific rules

### Variable Management

Smart variable handling across requests:

- **ID Persistence**: Created IDs are stored for subsequent requests
- **Dynamic Data**: Test data is generated and reused
- **Cleanup**: Variables are cleared after logout

## 🎯 Usage Scenarios

### Quick API Testing

1. Start with **Authentication** → Register User
2. Test **Categories Management** → Create/List/Update
3. Test **Products Management** → Full CRUD operations
4. Explore **Search & Filters** → Various search scenarios

### Full Workflow Testing

Run the **Complete Workflow Tests** folder sequentially:

1. User registration and authentication
2. Category and product setup
3. Search and filtering validation
4. Inventory management operations
5. Session verification and cleanup

### Development Testing

- Use individual requests for debugging specific endpoints
- Modify request data to test edge cases
- Run collections in different environments

## 🔍 Advanced Features

### Pre-request Scripts

- **Token validation**: Check token expiry before requests
- **Auto-refresh**: Automatically renew tokens when needed
- **Environment setup**: Prepare variables for testing

### Test Scripts

- **Response validation**: Comprehensive response checking
- **Data extraction**: Extract IDs and tokens for future use
- **Console logging**: Detailed test progress reporting
- **Variable management**: Smart cleanup and persistence

### Error Handling

- **Authentication errors**: Proper handling of invalid tokens
- **Validation errors**: Clear reporting of validation failures
- **Network errors**: Graceful handling of connection issues

## 📊 Test Results

### Success Indicators

- ✅ All status codes are 200/201 as expected
- ✅ Response structures match API specifications
- ✅ Authentication flows work correctly
- ✅ CRUD operations function properly
- ✅ Search and filtering return relevant results

### Common Issues

- ❌ **401 Unauthorized**: Check if API is running and tokens are valid
- ❌ **404 Not Found**: Verify endpoint URLs and resource IDs
- ❌ **422 Validation Error**: Check request payload format
- ❌ **500 Server Error**: Verify database connection and API health

## 🛠️ Customization

### Modifying Test Data

Edit request bodies to test with different data:

```json
{
  "name": "Your Product Name",
  "description": "Your Description",
  "price": 99.99
}
```

### Adding New Tests

Add custom test assertions in the "Tests" tab:

```javascript
pm.test('Custom validation', function () {
  const responseJson = pm.response.json();
  pm.expect(responseJson.customField).to.equal('expectedValue');
});
```

### Environment Variables

Set additional variables for different testing environments:

- `staging_url`: For staging environment testing
- `production_url`: For production validation
- `test_user_email`: For consistent test user data

## 🚀 Running the Collection

### Individual Requests

1. Select any request from the collection
2. Click "Send" to execute
3. Review response and test results

### Folder Execution

1. Right-click on any folder (e.g., "Authentication")
2. Select "Run folder"
3. Choose execution order and intervals
4. Review comprehensive test results

### Collection Runner

1. Click "Run" on the collection
2. Select requests/folders to include
3. Configure iterations and delays
4. Execute and analyze results

## 📝 Best Practices

### Before Testing

1. Ensure API server is running
2. Database is connected and accessible
3. Clear any existing test data if needed

### During Testing

1. Follow the logical sequence (Auth → Categories → Products)
2. Monitor console logs for detailed information
3. Check test results for any failures

### After Testing

1. Run logout requests to clean up sessions
2. Review any failed tests for debugging
3. Clear sensitive data from variables

This comprehensive Postman collection provides everything needed to thoroughly test the Inventory API's authentication system, CRUD operations, search functionality, and complete workflow scenarios.
