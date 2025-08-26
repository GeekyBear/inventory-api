# Contributing to Inventory Management API

Thank you for considering contributing to the Inventory Management API! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)
   - Error messages or logs

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from `dev`:
   ```bash
   git checkout -b feature/your-feature-name dev
   ```
3. **Make your changes** following the coding standards
4. **Add tests** for new functionality
5. **Ensure all tests pass**:
   ```bash
   npm test
   npm run test:e2e
   ```
6. **Run linting**:
   ```bash
   npm run lint
   ```
7. **Update documentation** if needed
8. **Commit with conventional commits**:
   ```bash
   git commit -m "feat: add new inventory feature"
   ```
9. **Push to your fork** and create a pull request

## 📋 Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0 (or use Docker)

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/GeekyBear/inventory-api.git
   cd inventory-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if using Docker):
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   ```

5. **Run the application**:
   ```bash
   npm run start:dev
   ```

## 🧪 Testing

### Test Coverage Requirements

We maintain **minimum 70% test coverage** across all metrics:
- Statements: 70%+
- Branches: 70%+
- Functions: 70%+
- Lines: 70%+

### Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests
npm run test:e2e

# E2E tests with coverage
npm run test:e2e:cov

# Watch mode
npm run test:watch
```

### Writing Tests

- **Unit tests**: Test individual components in isolation
- **Integration tests**: Test service interactions
- **E2E tests**: Test complete API workflows
- **Mock external dependencies** appropriately
- **Use descriptive test names** that explain the behavior being tested

## 🎯 Coding Standards

### TypeScript Guidelines

- Use **strict TypeScript** configuration
- Define **interfaces** for all data structures
- Use **DTOs** for request/response validation
- Follow **NestJS best practices**

### Code Style

- Use **ESLint** configuration provided
- Follow **Prettier** formatting
- Use **conventional commit** messages
- Write **self-documenting code** with clear variable names

### File Organization

```
src/
├── modules/           # Feature modules
│   ├── products/
│   ├── categories/
│   └── health/
├── common/           # Shared utilities
├── config/           # Configuration files
└── database/         # Database setup
```

## 🔄 Branch Strategy

- **`main`**: Production-ready code
- **`dev`**: Development integration branch
- **Feature branches**: `feature/description`
- **Bugfix branches**: `fix/description`

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(products): add low stock monitoring
fix(search): resolve pagination issue
docs(readme): update installation instructions
test(categories): add integration tests
```

## 🚀 Release Process

1. **Create release branch** from `dev`
2. **Update version** in `package.json`
3. **Update CHANGELOG.md**
4. **Create pull request** to `main`
5. **Tag release** after merge
6. **Deploy to production**

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

- **Create an issue** for bugs or feature requests
- **Start a discussion** for questions or ideas
- **Check existing documentation** first

Thank you for contributing! 🎉
