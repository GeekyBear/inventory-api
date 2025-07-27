# Copilot Instructions for Inventory API

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a NestJS TypeScript microservice for inventory management with MongoDB integration.

## Project Overview
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Architecture**: Microservice with modular structure
- **Features**: Products CRUD, Categories management, Search functionality

## Development Guidelines
- Use TypeScript interfaces and DTOs for type safety
- Follow NestJS best practices with modules, controllers, and services
- Implement proper error handling and validation
- Use MongoDB schemas with Mongoose
- Follow RESTful API conventions
- Implement proper logging and monitoring

## Branch Strategy
- `main`: Production-ready code
- `dev`: Development integration branch
- Feature branches: `feature/product-management`, `feature/category-management`, `feature/search-system`

## Code Style
- Use decorators for validation, transformation, and documentation
- Implement proper dependency injection
- Use environment variables for configuration
- Follow consistent naming conventions
- Write unit and integration tests
