# White Box Testing with Jest

This document describes how to perform white box testing for our backend application using Jest.

## Setup

We've set up Jest with the following configuration:
- Babel to handle ES modules
- Custom test timeout to prevent premature test failures
- Mock implementations for external dependencies

## Running Tests

To run all tests:
```
npm test
```

To run a specific test file:
```
npm test -- path/to/test/file.js
```

For example:
```
npm test -- __tests__/controllers/auth.controller.test.js
```

To run tests in watch mode (automatically re-run when files change):
```
npm run test:watch
```

## Test Structure

Our tests follow this structure:

1. **Controller Tests**: Test the business logic
   - Located in `__tests__/controllers/`
   - Focus on testing controller functions in isolation
   - Mock database interactions

2. **Model Tests**: Test database models
   - Located in `__tests__/models/`
   - Test schema validation, methods, and hooks
   - Use mock implementations for mongoose

3. **Route Tests**: Test API endpoints
   - Located in `__tests__/routes/`
   - Test route definitions and middleware integration
   - Use supertest for HTTP requests

4. **Integration Tests**: Test multiple components together
   - Located in `__tests__/integration/`
   - Test how components work together
   - May use a test database

## Best Practices

1. **Test in Isolation**: Mock external dependencies to isolate the component being tested.
2. **AAA Pattern**: Arrange (setup), Act (execute), Assert (verify).
3. **Focus on Behavior**: Test what the component does, not how it does it.
4. **Descriptive Test Names**: Use descriptive names for test cases.
5. **One Assertion Per Test**: Keep tests focused on a single behavior.

## Creating New Tests

When creating new tests:

1. Create a test file in the appropriate directory
2. Import the component to test
3. Mock any dependencies
4. Write test cases using the `describe` and `it` syntax
5. Use Jest matchers to verify expectations

## Examples

### Controller Test Example

```javascript
// __tests__/controllers/someController.test.js
const { myFunction } = require('../../controllers/someController');
const SomeModel = require('../../models/someModel');

jest.mock('../../models/someModel');

describe('Some Controller', () => {
  let req, res;
  
  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });
  
  it('should return data successfully', async () => {
    // Arrange
    SomeModel.find.mockResolvedValue([{ name: 'test' }]);
    
    // Act
    await myFunction(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ name: 'test' }]);
  });
});
```

### Model Test Example

```javascript
// __tests__/models/someModel.test.js
const mongoose = require('mongoose');
const SomeModel = require('../../models/someModel');

describe('Some Model', () => {
  it('should validate required fields', () => {
    const model = new SomeModel({});
    const validationError = model.validateSync();
    
    expect(validationError.errors.name).toBeDefined();
  });
});
```

## Troubleshooting

Common issues and solutions:

1. **ES Module Issues**: Use CommonJS syntax in tests or configure Babel properly.
2. **Jest Timeout**: Increase timeout for slow tests.
3. **Mock Not Working**: Check that the mock path matches the actual import path.
4. **Unresolved Promises**: Ensure async tests use `await` or return promises.

## Improving Test Coverage

To check and improve test coverage:

1. Run tests with coverage report:
```
npm test -- --coverage
```

2. Review coverage report to identify untested code.
3. Add tests for untested code areas, focusing on critical paths first. 