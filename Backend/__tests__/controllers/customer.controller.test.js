import jwt from 'jsonwebtoken';
import Customer from '../../models/customer.js';
import Cart from '../../models/cart.js';
import * as customerController from '../../controllers/customer.controller.js';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/customer.js');
jest.mock('../../models/cart.js');

describe('Customer Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      userId: 'mockUserId'
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('registerCustomer', () => {
    it('should register a new customer and create a cart', async () => {
      // Arrange
      const customerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test St'
      };
      
      req.body = customerData;
      
      Customer.findOne.mockResolvedValue(null);
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.mockImplementation(() => mockCustomer);
      
      const mockCart = {
        save: jest.fn().mockResolvedValue()
      };
      
      Cart.mockImplementation(() => mockCart);
      
      jwt.sign.mockReturnValue('mockToken');
      
      // Act
      await customerController.registerCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: customerData.email });
      expect(Customer).toHaveBeenCalledWith(customerData);
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(Cart).toHaveBeenCalledWith({
        customer: 'mockCustomerId',
        items: []
      });
      expect(mockCart.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockCustomerId', email: customerData.email, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        customer: {
          id: 'mockCustomerId',
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address
        },
        token: 'mockToken'
      });
    });
    
    it('should return 400 if email already exists', async () => {
      // Arrange
      req.body = {
        email: 'existing@example.com'
      };
      
      Customer.findOne.mockResolvedValue({ email: 'existing@example.com' });
      
      // Act
      await customerController.registerCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com'
      };
      
      const error = new Error('Database error');
      Customer.findOne.mockRejectedValue(error);
      
      // Act
      await customerController.registerCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
    
    it('should register a customer with complex address structure', async () => {
      // Arrange
      const customerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'Test Country'
        }
      };
      
      req.body = customerData;
      
      Customer.findOne.mockResolvedValue(null);
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.mockImplementation(() => mockCustomer);
      
      const mockCart = {
        save: jest.fn().mockResolvedValue()
      };
      
      Cart.mockImplementation(() => mockCart);
      
      jwt.sign.mockReturnValue('mockToken');
      
      // Act
      await customerController.registerCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: customerData.email });
      expect(Customer).toHaveBeenCalledWith(customerData);
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(Cart).toHaveBeenCalledWith({
        customer: 'mockCustomerId',
        items: []
      });
      expect(mockCart.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockCustomerId', email: customerData.email, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        customer: {
          id: 'mockCustomerId',
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address
        },
        token: 'mockToken'
      });
    });
    
    it('should register a customer without optional fields', async () => {
      // Arrange
      const customerData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
        // No phone or address
      };
      
      req.body = customerData;
      
      Customer.findOne.mockResolvedValue(null);
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: customerData.name,
        email: customerData.email,
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.mockImplementation(() => mockCustomer);
      
      const mockCart = {
        save: jest.fn().mockResolvedValue()
      };
      
      Cart.mockImplementation(() => mockCart);
      
      jwt.sign.mockReturnValue('mockToken');
      
      // Act
      await customerController.registerCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: customerData.email });
      expect(Customer).toHaveBeenCalledWith(customerData);
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(Cart).toHaveBeenCalledWith({
        customer: 'mockCustomerId',
        items: []
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
  
  describe('loginCustomer', () => {
    it('should login a customer with valid credentials', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      Customer.findOne.mockResolvedValue(mockCustomer);
      jwt.sign.mockReturnValue('mockToken');
      
      // Act
      await customerController.loginCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCustomer.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockCustomerId', email: 'test@example.com', role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        customer: {
          id: 'mockCustomerId',
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          address: '123 Test St'
        },
        token: 'mockToken'
      });
    });
    
    it('should return 404 if customer is not found', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      Customer.findOne.mockResolvedValue(null);
      
      // Act
      await customerController.loginCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
    
    it('should return 400 if password is incorrect', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      const mockCustomer = {
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      
      Customer.findOne.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.loginCustomer(req, res);
      
      // Assert
      expect(Customer.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCustomer.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const error = new Error('Database error');
      Customer.findOne.mockRejectedValue(error);
      
      // Act
      await customerController.loginCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
    
    it('should validate both email and password are provided', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com'
        // No password
      };
      
      // Act
      await customerController.loginCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });
  });
  
  describe('getCurrentCustomer', () => {
    it('should return the current customer profile', async () => {
      // Arrange
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St'
      };
      
      const selectMock = jest.fn().mockResolvedValue(mockCustomer);
      Customer.findById.mockReturnValue({
        select: selectMock
      });
      
      // Act
      await customerController.getCurrentCustomer(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });
    
    it('should return 404 if customer is not found', async () => {
      // Arrange
      const selectMock = jest.fn().mockResolvedValue(null);
      Customer.findById.mockReturnValue({
        select: selectMock
      });
      
      // Act
      await customerController.getCurrentCustomer(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Arrange
      const error = new Error('Database error');
      // Use mockRejectedValue with the error object
      Customer.findById.mockImplementation(() => {
        throw error;
      });
      
      // Act
      await customerController.getCurrentCustomer(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
    
    it('should handle multiple database operations efficiently', async () => {
      // Arrange
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
      };
      
      const selectMock = jest.fn().mockResolvedValue(mockCustomer);
      Customer.findById.mockReturnValue({
        select: selectMock
      });
      
      // Mock Cart to verify cart operations are not performed in getCurrentCustomer
      Cart.findOne = jest.fn();
      
      // Act
      await customerController.getCurrentCustomer(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(selectMock).toHaveBeenCalledWith('-password');
      // Verify Cart operations are not performed
      expect(Cart.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
  
  describe('updateCustomerProfile', () => {
    it('should update customer profile with provided data', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name',
        phone: '9876543210',
        address: '456 New St'
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(mockCustomer.name).toBe('Updated Name');
      expect(mockCustomer.phone).toBe('9876543210');
      expect(mockCustomer.address).toBe('456 New St');
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 'mockCustomerId',
        name: 'Updated Name',
        email: 'test@example.com',
        phone: '9876543210',
        address: '456 New St'
      });
    });
    
    it('should keep existing values for fields not provided in the update', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name'
        // No phone or address provided
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St',
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(mockCustomer.name).toBe('Updated Name');
      expect(mockCustomer.phone).toBe('1234567890'); // Unchanged
      expect(mockCustomer.address).toBe('123 Test St'); // Unchanged
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: 'mockCustomerId',
        name: 'Updated Name',
        email: 'test@example.com',
        phone: '1234567890',
        address: '123 Test St'
      });
    });
    
    it('should return 404 if customer is not found', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name'
      };
      
      Customer.findById.mockResolvedValue(null);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
    
    it('should return 500 if an error occurs', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name'
      };
      
      // Use mockImplementation with throw instead of mockRejectedValue
      Customer.findById.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
    
    it('should update complex address structure', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name',
        phone: '9876543210',
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'NS',
          zipCode: '54321',
          country: 'New Country'
        }
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(mockCustomer.name).toBe('Updated Name');
      expect(mockCustomer.phone).toBe('9876543210');
      expect(mockCustomer.address).toEqual({
        street: '456 New St',
        city: 'New City',
        state: 'NS',
        zipCode: '54321',
        country: 'New Country'
      });
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should handle updating only address object', async () => {
      // Arrange
      req.body = {
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'NS',
          zipCode: '54321'
        }
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(mockCustomer.name).toBe('Test User'); // Unchanged
      expect(mockCustomer.phone).toBe('1234567890'); // Unchanged
      expect(mockCustomer.address).toEqual({
        street: '456 New St',
        city: 'New City',
        state: 'NS',
        zipCode: '54321'
      });
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should handle updating from no address to address', async () => {
      // Arrange
      req.body = {
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'NS',
          zipCode: '54321'
        }
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        // No address initially
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(mockCustomer.address).toEqual({
        street: '456 New St',
        city: 'New City',
        state: 'NS',
        zipCode: '54321'
      });
      expect(mockCustomer.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should validate phone number format', async () => {
      // Arrange
      req.body = {
        phone: 'invalid-phone'
      };
      
      const mockCustomer = {
        _id: 'mockCustomerId',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        save: jest.fn().mockResolvedValue()
      };
      
      Customer.findById.mockResolvedValue(mockCustomer);
      
      // Act
      await customerController.updateCustomerProfile(req, res);
      
      // Assert
      expect(Customer.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid phone number format' });
    });
  });
}); 