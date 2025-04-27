# Trintendo Backend

This is the backend for the Trintendo food delivery application.

## Setup

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

3. Run the development server:
```
npm run dev
```

## Testing

The project uses Jest for unit and integration testing. 

### Running Tests

Run all tests:
```
npm test
```

Run tests in watch mode:
```
npm run test:watch
```

Run a specific test file:
```
npm test -- path/to/test/file.js
```

### Test Structure

The tests are organized into the following directories:

- `__tests__/controllers/`: Tests for API controllers
- `__tests__/models/`: Tests for database models
- `__tests__/routes/`: Tests for API routes
- `__tests__/server.test.js`: Server configuration tests

### Testing Approach

We use white box testing to verify the internal workings of our components:

1. **Controller Tests**: Verify controller logic including error handling, database interactions, and response formatting
2. **Model Tests**: Test model validation, middleware, and methods
3. **Route Tests**: Ensure routes are properly set up and middleware is applied correctly
4. **Server Tests**: Test server configuration and middleware setup

### Mocking

We use Jest's mocking capabilities to isolate components for testing:

1. External dependencies like `mongoose` and `jsonwebtoken` are mocked
2. Middleware is mocked to test route handlers in isolation
3. Request and response objects are mocked to test controller functions

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login user
- `GET /api/auth/me`: Get current user information

### Restaurants
- `GET /api/restaurants`: Get all restaurants
- `GET /api/restaurants/:id`: Get restaurant by ID
- `POST /api/restaurants`: Create new restaurant (admin only)
- `PUT /api/restaurants/:id`: Update restaurant (admin only)
- `DELETE /api/restaurants/:id`: Delete restaurant (admin only)

### Orders
- `GET /api/orders`: Get user orders
- `GET /api/orders/:id`: Get order by ID
- `POST /api/orders`: Create new order
- `PUT /api/orders/:id`: Update order status

### Cart
- `GET /api/cart`: Get user cart
- `POST /api/cart`: Add item to cart
- `PUT /api/cart/:itemId`: Update cart item
- `DELETE /api/cart/:itemId`: Remove item from cart

### Payments
- `POST /api/payments/intent`: Create payment intent
- `POST /api/payments/webhook`: Handle Stripe webhook

### Rider
- `GET /api/rider/orders`: Get rider orders
- `PUT /api/rider/orders/:id`: Update order status

## Folder Structure

```
Backend/
├── controllers/     # API controllers
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── routes/          # Express routes
├── .env             # Environment variables
├── .babelrc         # Babel configuration
├── jest.config.json # Jest configuration
├── package.json     # Project dependencies
└── server.js        # Main application file
``` 