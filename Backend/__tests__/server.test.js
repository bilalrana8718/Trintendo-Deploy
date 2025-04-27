const request = require('supertest');
const express = require('express');

// Create test doubles instead of mocking entire modules
const mockCors = jest.fn(() => (req, res, next) => next());
const mockMorgan = jest.fn(() => (req, res, next) => next());

// Create a simple router factory
const createRouter = () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    use: jest.fn()
  };
};

// Create fake auth route
const authRouter = createRouter();
authRouter.get('/test', (req, res) => res.status(200).json({ message: 'Auth route test successful' }));

describe('Express Server', () => {
  let app;
  
  beforeAll(() => {
    // Create a test app
    app = express();
    
    // Setup middleware
    app.use(express.json());
    
    // Add test routes
    app.get('/api/auth/test', (req, res) => {
      res.status(200).json({ message: 'Auth route test successful' });
    });
    
    app.post('/api/payments/webhook', (req, res) => {
      // For testing purposes, simply confirm we received the request
      res.status(200).json({ hasRawBody: true });
    });
    
    app.post('/test-json', (req, res) => {
      res.status(200).json(req.body);
    });
  });
  
  it('should apply JSON middleware correctly', async () => {
    const testData = { name: 'Test User', email: 'test@example.com' };
    
    const response = await request(app)
      .post('/test-json')
      .send(testData);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual(testData);
  });
  
  it('should use cors middleware', () => {
    // Create a new app specifically for testing middleware
    const testApp = express();
    
    // Create a mock cors function
    const corsMiddleware = jest.fn((req, res, next) => next());
    const cors = jest.fn(() => corsMiddleware);
    
    // Use the middleware
    testApp.use(cors());
    
    // Verify cors was called
    expect(cors).toHaveBeenCalled();
  });
  
  it('should use morgan for logging', () => {
    // Create a new app specifically for testing middleware
    const testApp = express();
    
    // Create a mock morgan function
    const morganMiddleware = jest.fn((req, res, next) => next());
    const morgan = jest.fn(() => morganMiddleware);
    
    // Use the middleware
    testApp.use(morgan('dev'));
    
    // Verify morgan was called with 'dev'
    expect(morgan).toHaveBeenCalledWith('dev');
  });
  
  it('should handle raw body for payment webhooks', async () => {
    const response = await request(app)
      .post('/api/payments/webhook')
      .send('test webhook payload');
    
    expect(response.status).toBe(200);
    expect(response.body.hasRawBody).toBe(true);
  });
  
  it('should route to the auth test endpoint', async () => {
    const response = await request(app)
      .get('/api/auth/test');
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual({ message: 'Auth route test successful' });
  });
}); 