const mongoose = require('mongoose');
const dbHandler = require('../../test-utils/db.js');
const paymentController = require('../../controllers/payment.controller.js');
const Order = require('../../models/order.js');

// Mock the required models and external dependencies
jest.mock('../../models/order.js', () => {
  return {
    findById: jest.fn(),
  };
});

// Mock Stripe
jest.mock('stripe', () => {
  return function() {
    return {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'session_123',
            url: 'https://checkout.stripe.com/pay/session_123'
          })
        }
      },
      webhooks: {
        constructEvent: jest.fn().mockImplementation((payload, signature, secret) => {
          if (payload === 'invalid_payload') {
            throw new Error('Invalid signature');
          }
          return typeof payload === 'string' ? JSON.parse(payload) : payload;
        })
      }
    };
  };
});

describe('Payment Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'mockUserId',
      headers: {},
      rawBody: ''
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  // Connect to in-memory database before tests
  beforeAll(async () => {
    await dbHandler.connect();
    process.env.STRIPE_KEY = 'mock_stripe_key';
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });
  
  // Clear database between tests
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
    delete process.env.STRIPE_KEY;
    delete process.env.FRONTEND_URL;
  });
  
  describe('createCheckoutSession', () => {
    it.skip('should create a Stripe checkout session and return URL', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.body = { orderId };
      
      const mockOrderItems = [
        {
          name: 'Pizza',
          price: 10.99,
          quantity: 2,
          image: 'pizza.jpg'
        }
      ];
      
      const mockOrder = {
        _id: orderId,
        customer: {
          toString: jest.fn().mockReturnValue(req.userId)
        },
        items: mockOrderItems,
        stripeSessionId: null,
        paymentMethod: 'cash',
        save: jest.fn().mockResolvedValue(true)
      };
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await paymentController.createCheckoutSession(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.stripeSessionId).toBe('session_123');
      expect(mockOrder.paymentMethod).toBe('card');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ url: 'https://checkout.stripe.com/pay/session_123' });
    });
    
    it('should return 404 when order is not found', async () => {
      // Arrange
      const orderId = 'invalidOrderId';
      req.body = { orderId };
      
      Order.findById.mockResolvedValue(null);
      
      // Act
      await paymentController.createCheckoutSession(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    it('should return 403 when user is not authorized to access the order', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.body = { orderId };
      
      const mockOrder = {
        _id: orderId,
        customer: {
          toString: jest.fn().mockReturnValue('differentUserId')
        }
      };
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await paymentController.createCheckoutSession(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Not authorized to access this order' 
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.body = { orderId: 'validOrderId' };
      
      Order.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await paymentController.createCheckoutSession(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith('validOrderId');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Payment processing failed',
        error: 'Database error'
      });
    });
  });
  
  describe('handleWebhookEvent', () => {
    it.skip('should handle checkout.session.completed event and update order', async () => {
      // Arrange
      const orderId = 'validOrderId';
      
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              orderId
            }
          }
        }
      };
      
      const mockOrder = {
        _id: orderId,
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.rawBody = JSON.stringify(mockEvent);
      req.headers['stripe-signature'] = 'mock_signature';
      
      Order.findById.mockResolvedValue(mockOrder);
      
      process.env.STRIPE_WEBHOOK_SECRET = 'mock_webhook_secret';
      
      // Act
      await paymentController.handleWebhookEvent(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.paymentStatus).toBe('completed');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
      
      delete process.env.STRIPE_WEBHOOK_SECRET;
    });
    
    it('should handle webhook with no signature in development mode', async () => {
      // Arrange
      const orderId = 'validOrderId';
      
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              orderId
            }
          }
        }
      };
      
      const mockOrder = {
        _id: orderId,
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.body = mockEvent;
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await paymentController.handleWebhookEvent(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.paymentStatus).toBe('completed');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });
    
    it.skip('should handle webhook verification error', async () => {
      // Arrange
      req.rawBody = 'invalid_payload';
      req.headers['stripe-signature'] = 'mock_signature';
      
      process.env.STRIPE_WEBHOOK_SECRET = 'mock_webhook_secret';
      
      // Act
      await paymentController.handleWebhookEvent(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Webhook Error: Invalid signature' 
      });
      
      delete process.env.STRIPE_WEBHOOK_SECRET;
    });
  });
}); 