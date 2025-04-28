const mongoose = require('mongoose');
const dbHandler = require('../../test-utils/db.js');
const riderController = require('../../controllers/rider.controller.js');
const Rider = require('../../models/rider.js');
const User = require('../../models/user.js');
const Order = require('../../models/order.js');
const jwt = require('jsonwebtoken');

// Mock the required models and external dependencies
jest.mock('../../models/rider.js', () => {
  // Mock constructor function
  function MockRider(data) {
    this._id = 'riderId123';
    this.user = data.user;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.vehicleType = data.vehicleType;
    this.vehicleNumber = data.vehicleNumber;
    this.save = jest.fn().mockResolvedValue(this);
  }
  
  // Static methods
  MockRider.findOne = jest.fn();
  
  return MockRider;
});

jest.mock('../../models/user.js', () => {
  // Mock constructor function
  function MockUser(data) {
    this._id = 'userId123';
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.save = jest.fn().mockResolvedValue(this);
    this.comparePassword = jest.fn();
  }
  
  // Static methods
  MockUser.findOne = jest.fn();
  
  return MockUser;
});

jest.mock('../../models/order.js', () => {
  return {
    find: jest.fn(),
    findById: jest.fn(),
  };
});

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn()
  };
});

describe('Rider Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'mockUserId',
      query: {}
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
    process.env.JWT_SECRET = 'test_jwt_secret';
  });
  
  // Clear database between tests
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
    delete process.env.JWT_SECRET;
  });
  
  describe('registerRider', () => {
    it('should register a new rider and return 201', async () => {
      // Arrange
      req.body = {
        name: 'Test Rider',
        email: 'rider@example.com',
        password: 'password123',
        phone: '1234567890',
        vehicleType: 'motorcycle',
        vehicleNumber: 'ABC123'
      };
      
      const mockToken = 'mock_jwt_token';
      
      User.findOne.mockResolvedValue(null);
      jwt.sign.mockReturnValue(mockToken);
      
      // Act
      await riderController.registerRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      // The save methods will now be called on the prototype-based instances
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'userId123', email: req.body.email, role: 'rider' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        rider: {
          id: 'riderId123',
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          vehicleType: req.body.vehicleType,
          vehicleNumber: req.body.vehicleNumber,
        },
        token: mockToken
      });
    });
    
    it('should return 400 when email is already registered', async () => {
      // Arrange
      req.body = {
        name: 'Test Rider',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      const existingUser = {
        _id: 'existingUserId',
        email: req.body.email
      };
      
      User.findOne.mockResolvedValue(existingUser);
      
      // Act
      await riderController.registerRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already registered' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.body = {
        name: 'Test Rider',
        email: 'rider@example.com',
        password: 'password123'
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await riderController.registerRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('loginRider', () => {
    it('should login rider and return 200 with token', async () => {
      // Arrange
      req.body = {
        email: 'rider@example.com',
        password: 'password123'
      };
      
      const mockUserId = 'userId123';
      
      const mockUser = {
        _id: mockUserId,
        email: req.body.email,
        role: 'rider',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      const mockRider = {
        _id: 'riderId123',
        user: mockUserId,
        name: 'Test Rider',
        email: req.body.email,
        phone: '1234567890',
        vehicleType: 'motorcycle',
        vehicleNumber: 'ABC123'
      };
      
      const mockToken = 'mock_jwt_token';
      
      User.findOne.mockResolvedValue(mockUser);
      Rider.findOne.mockResolvedValue(mockRider);
      jwt.sign.mockReturnValue(mockToken);
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(req.body.password);
      expect(Rider.findOne).toHaveBeenCalledWith({ user: mockUserId });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUserId, email: req.body.email, role: 'rider' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        rider: {
          id: mockRider._id,
          name: mockRider.name,
          email: mockRider.email,
          phone: mockRider.phone,
          vehicleType: mockRider.vehicleType,
          vehicleNumber: mockRider.vehicleNumber,
        },
        token: mockToken
      });
    });
    
    it('should return 404 when rider not found', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      User.findOne.mockResolvedValue(null);
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Rider not found' });
    });
    
    it('should return 403 when user is not a rider', async () => {
      // Arrange
      req.body = {
        email: 'customer@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'userId123',
        email: req.body.email,
        role: 'customer'
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
    
    it('should return 400 when password is incorrect', async () => {
      // Arrange
      req.body = {
        email: 'rider@example.com',
        password: 'wrongpassword'
      };
      
      const mockUser = {
        _id: 'userId123',
        email: req.body.email,
        role: 'rider',
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(req.body.password);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
    
    it('should return 404 when rider profile not found', async () => {
      // Arrange
      req.body = {
        email: 'rider@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        _id: 'userId123',
        email: req.body.email,
        role: 'rider',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      
      User.findOne.mockResolvedValue(mockUser);
      Rider.findOne.mockResolvedValue(null);
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(req.body.password);
      expect(Rider.findOne).toHaveBeenCalledWith({ user: mockUser._id });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Rider profile not found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.body = {
        email: 'rider@example.com',
        password: 'password123'
      };
      
      User.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await riderController.loginRider(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('getDeliveryRequests', () => {
    it('should return available delivery requests with status 200', async () => {
      // Arrange
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'available'
      };
      
      const mockOrders = [
        {
          _id: 'order1',
          status: 'ready_for_pickup',
          restaurant: 'restaurantId1',
          customer: 'customerId1'
        },
        {
          _id: 'order2',
          status: 'ready_for_pickup',
          restaurant: 'restaurantId2',
          customer: 'customerId2'
        }
      ];
      
      Rider.findOne.mockResolvedValue(mockRider);
      
      const orderFindMock = {
        populate: jest.fn().mockReturnThis(),
      };
      orderFindMock.populate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOrders)
      });
      
      Order.find.mockReturnValue(orderFindMock);
      
      // Act
      await riderController.getDeliveryRequests(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(Order.find).toHaveBeenCalledWith({
        status: 'ready_for_pickup',
        rider: { $exists: false },
        $or: [
          { declinedRiders: { $ne: mockRider._id } },
          { declinedRiders: { $exists: false } }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
    
    it('should return 403 when user is not a rider', async () => {
      // Arrange
      Rider.findOne.mockResolvedValue(null);
      
      // Act
      await riderController.getDeliveryRequests(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Rider.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await riderController.getDeliveryRequests(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('acceptDeliveryRequest', () => {
    it('should accept delivery request and return 200', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'available',
        save: jest.fn().mockResolvedValue(true)
      };
      
      const mockOrder = {
        _id: orderId,
        status: 'ready_for_pickup',
        rider: null,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockReturnThis()
      };
      
      Rider.findOne.mockResolvedValue(mockRider);
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.rider).toBe(mockRider._id);
      expect(mockOrder.status).toBe('picked_up');
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockRider.status).toBe('busy');
      expect(mockRider.save).toHaveBeenCalled();
      expect(mockOrder.populate).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Delivery request accepted successfully',
        order: mockOrder
      });
    });
    
    it('should return 403 when user is not a rider', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      Rider.findOne.mockResolvedValue(null);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as rider' });
    });
    
    it('should return 400 when rider is not available', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'busy'
      };
      
      Rider.findOne.mockResolvedValue(mockRider);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: `Cannot accept orders while status is ${mockRider.status}`
      });
    });
    
    it('should return 404 when order not found', async () => {
      // Arrange
      const orderId = 'invalidOrderId';
      req.params.orderId = orderId;
      
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'available'
      };
      
      Rider.findOne.mockResolvedValue(mockRider);
      Order.findById.mockResolvedValue(null);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    it('should return 400 when order is not ready for pickup', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'available'
      };
      
      const mockOrder = {
        _id: orderId,
        status: 'pending'
      };
      
      Rider.findOne.mockResolvedValue(mockRider);
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order is not ready for pickup' });
    });
    
    it('should return 400 when order is already assigned to a rider', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      const mockRider = {
        _id: 'riderId123',
        user: req.userId,
        name: 'Test Rider',
        status: 'available'
      };
      
      const mockOrder = {
        _id: orderId,
        status: 'ready_for_pickup',
        rider: 'anotherRiderId'
      };
      
      Rider.findOne.mockResolvedValue(mockRider);
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'This order has already been taken by another rider' 
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.orderId = orderId;
      
      Rider.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await riderController.acceptDeliveryRequest(req, res);
      
      // Assert
      expect(Rider.findOne).toHaveBeenCalledWith({ user: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to accept delivery request',
        error: 'Database error'
      });
    });
  });
}); 