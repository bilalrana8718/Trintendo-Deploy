// Set environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.JWT_SECRET = 'test-secret-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';

// Note: MongoDB URI is not set here as we're using in-memory MongoDB

// Use specific mocks where needed
jest.mock('stripe', () => {
  return jest.fn(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: 'cs_test123', url: 'https://test.com' }),
      },
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({ 
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test123', metadata: { orderId: 'order123' } } }
      }),
    }
  }));
}); 