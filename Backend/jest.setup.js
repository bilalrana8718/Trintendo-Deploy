// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret'; 