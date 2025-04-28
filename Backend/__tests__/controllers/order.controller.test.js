import mongoose from 'mongoose';
import dbHandler from '../../test-utils/db.js';
import * as orderController from '../../controllers/order.controller.js';

// Mock the models
jest.mock('../../models/order.js', () => {
  const mockModel = jest.fn().mockImplementation((data) => {
    const instance = {
      ...data,
      save: jest.fn().mockResolvedValue(data),
      toString: jest.fn().mockReturnValue(data._id || 'mockId')
    };
    
    // Add toString method to customer field if it exists
    if (instance.customer) {
      instance.customer = {
        _id: instance.customer,
        toString: jest.fn().mockReturnValue(instance.customer)
      };
    }
    
    return instance;
  });
  
  mockModel.find = jest.fn().mockReturnThis();
  mockModel.findById = jest.fn().mockReturnThis();
  mockModel.sort = jest.fn().mockReturnThis();
  mockModel.populate = jest.fn().mockResolvedValue([]);
  
  return mockModel;
});

jest.mock('../../models/cart.js', () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  save: jest.fn().mockResolvedValue({})
}));

jest.mock('../../models/customer.js', () => ({
  findById: jest.fn(),
  save: jest.fn().mockResolvedValue({})
}));

jest.mock('../../models/restaurant.js', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  save: jest.fn().mockResolvedValue({})
}));

// Import mocked models
import Order from '../../models/order.js';
import Cart from '../../models/cart.js';
import Customer from '../../models/customer.js';
import Restaurant from '../../models/restaurant.js';

describe('Order Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'mockUserId',
      userRole: 'customer',
      query: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  // Connect to in-memory database before tests
  beforeAll(async () => {
    await dbHandler.connect();
  });
  
  // Clear database between tests
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });
  
  describe('createOrder', () => {
    it('should create a new order and return 201', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [
          {
            menuItem: {
              _id: 'menuItem1',
              name: 'Item 1',
              price: 10,
              restaurant: 'restaurant1'
            },
            quantity: 2,
            price: 10,
            name: 'Item 1',
            image: 'item1.jpg'
          }
        ],
        restaurant: 'restaurant1',
        total: 20,
        save: jest.fn().mockResolvedValue({})
      };
      
      const mockCustomer = {
        _id: req.userId,
        name: 'Test Customer',
        address: '123 Test St'
      };
      
      const mockOrder = {
        _id: 'order1',
        customer: req.userId,
        restaurant: 'restaurant1',
        items: [
          {
            menuItem: 'menuItem1',
            name: 'Item 1',
            price: 10,
            quantity: 2,
            image: 'item1.jpg'
          }
        ],
        totalAmount: 20,
        deliveryAddress: '123 Test St',
        paymentMethod: 'cash',
        status: 'pending',
        save: jest.fn().mockResolvedValue({
          _id: 'order1',
          customer: req.userId,
          restaurant: 'restaurant1',
          items: [
            {
              menuItem: 'menuItem1',
              name: 'Item 1',
              price: 10,
              quantity: 2,
              image: 'item1.jpg'
            }
          ],
          totalAmount: 20,
          deliveryAddress: '123 Test St',
          paymentMethod: 'cash',
          status: 'pending'
        })
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      Customer.findById.mockResolvedValue(mockCustomer);
      Order.mockImplementation(() => mockOrder);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(Customer.findById).toHaveBeenCalledWith(req.userId);
      expect(Order).toHaveBeenCalled();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 400 when cart is empty', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: []
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Your cart is empty' });
    });
    
    it('should return 404 when customer is not found', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [
          {
            menuItem: {
              _id: 'menuItem1',
              name: 'Item 1',
              price: 10
            },
            quantity: 2
          }
        ]
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      Customer.findById.mockResolvedValue(null);
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(Customer.findById).toHaveBeenCalledWith(req.userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Cart.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await orderController.createOrder(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('getCustomerOrders', () => {
    it('should return customer orders with status 200', async () => {
      // Arrange
      const mockOrders = [
        {
          _id: 'order1',
          customer: req.userId,
          restaurant: {
            _id: 'restaurant1',
            name: 'Restaurant 1',
            address: '123 Test St'
          },
          items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
          totalAmount: 21.98,
          status: 'delivered'
        },
        {
          _id: 'order2',
          customer: req.userId,
          restaurant: {
            _id: 'restaurant2',
            name: 'Restaurant 2',
            address: '456 Test St'
          },
          items: [{ name: 'Burger', price: 8.99, quantity: 1 }],
          totalAmount: 8.99,
          status: 'pending'
        }
      ];
      
      Order.find.mockReturnThis();
      Order.sort.mockReturnThis();
      Order.populate.mockResolvedValue(mockOrders);
      
      // Act
      await orderController.getCustomerOrders(req, res);
      
      // Assert
      expect(Order.find).toHaveBeenCalledWith({ customer: req.userId });
      expect(Order.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Order.populate).toHaveBeenCalledWith('restaurant', 'name address');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Order.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await orderController.getCustomerOrders(req, res);
      
      // Assert
      expect(Order.find).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('getOrderById', () => {
    it('should return order with status 200 when order belongs to customer', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.id = orderId;
      
      const mockOrder = {
        _id: orderId,
        customer: req.userId,
        restaurant: {
          _id: 'restaurant1',
          name: 'Restaurant 1',
          address: '123 Test St',
          phone: '1234567890'
        },
        items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
        totalAmount: 21.98,
        status: 'delivered',
        toString: jest.fn().mockReturnValue(req.userId)
      };
      
      Order.findById.mockReturnThis();
      Order.populate.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(Order.populate).toHaveBeenCalledWith('restaurant', 'name address phone');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });
    
    it('should return 404 when order not found', async () => {
      // Arrange
      req.params.id = 'invalidOrderId';
      
      Order.findById.mockReturnThis();
      Order.populate.mockResolvedValue(null);
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith('invalidOrderId');
      expect(Order.populate).toHaveBeenCalledWith('restaurant', 'name address phone');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    it('should return 403 when order does not belong to customer', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.id = orderId;
      
      const mockOrder = {
        _id: orderId,
        customer: 'differentUserId',
        restaurant: 'restaurant1',
        items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
        totalAmount: 21.98,
        status: 'delivered'
      };
      
      Order.findById.mockReturnThis();
      Order.populate.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(Order.populate).toHaveBeenCalledWith('restaurant', 'name address phone');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized to view this order'
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = 'validOrderId';
      
      Order.findById.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await orderController.getOrderById(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith('validOrderId');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('cancelOrder', () => {
    it('should cancel order and return 200 when order can be cancelled', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.id = orderId;
      
      const mockOrder = {
        _id: orderId,
        customer: req.userId,
        restaurant: 'restaurant1',
        items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
        totalAmount: 21.98,
        status: 'pending',
        toString: jest.fn().mockReturnValue(req.userId),
        save: jest.fn().mockResolvedValue({
          _id: orderId,
          customer: req.userId,
          restaurant: 'restaurant1',
          items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
          totalAmount: 21.98,
          status: 'cancelled'
        })
      };
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.cancelOrder(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      
      // Change the assertion to check specific properties instead of exact object
      expect(res.json).toHaveBeenCalled();
      const jsonResponse = res.json.mock.calls[0][0];
      expect(jsonResponse._id).toBe(orderId);
      expect(jsonResponse.customer).toBe(req.userId);
      expect(jsonResponse.restaurant).toBe('restaurant1');
      expect(jsonResponse.items).toEqual([{ name: 'Pizza', price: 10.99, quantity: 2 }]);
      expect(jsonResponse.totalAmount).toBe(21.98);
      expect(jsonResponse.status).toBe('cancelled');
    });
    
    it('should return 404 when order not found', async () => {
      // Arrange
      req.params.id = 'invalidOrderId';
      
      Order.findById.mockResolvedValue(null);
      
      // Act
      await orderController.cancelOrder(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith('invalidOrderId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Order not found' });
    });
    
    it('should return 403 when order does not belong to customer', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.id = orderId;
      
      const mockOrder = {
        _id: orderId,
        customer: 'differentUserId',
        restaurant: 'restaurant1',
        status: 'pending'
      };
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.cancelOrder(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Not authorized to cancel this order'
      });
    });
    
    it('should return 400 when order cannot be cancelled', async () => {
      // Arrange
      const orderId = 'validOrderId';
      req.params.id = orderId;
      
      const mockOrder = {
        _id: orderId,
        customer: req.userId,
        restaurant: 'restaurant1',
        status: 'delivered'
      };
      
      Order.findById.mockResolvedValue(mockOrder);
      
      // Act
      await orderController.cancelOrder(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith(orderId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'This order cannot be cancelled'
      });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = 'validOrderId';
      
      Order.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await orderController.cancelOrder(req, res);
      
      // Assert
      expect(Order.findById).toHaveBeenCalledWith('validOrderId');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('getRestaurantOrders', () => {
    it('should return restaurant orders with status 200 when user is owner', async () => {
      // Arrange
      req.userRole = 'owner';
      
      const mockRestaurants = [
        { _id: 'restaurant1' },
        { _id: 'restaurant2' }
      ];
      
      const mockOrders = [
        {
          _id: 'order1',
          restaurant: 'restaurant1',
          customer: {
            _id: 'customer1',
            name: 'Customer 1',
            email: 'customer1@test.com',
            phone: '1234567890'
          },
          items: [{ name: 'Pizza', price: 10.99, quantity: 2 }],
          totalAmount: 21.98,
          status: 'delivered'
        },
        {
          _id: 'order2',
          restaurant: 'restaurant2',
          customer: {
            _id: 'customer2',
            name: 'Customer 2',
            email: 'customer2@test.com',
            phone: '0987654321'
          },
          items: [{ name: 'Burger', price: 8.99, quantity: 1 }],
          totalAmount: 8.99,
          status: 'pending'
        }
      ];
      
      Restaurant.find.mockResolvedValue(mockRestaurants);
      
      Order.find.mockReturnThis();
      Order.sort.mockReturnThis();
      Order.populate.mockResolvedValue(mockOrders);
      
      // Act
      await orderController.getRestaurantOrders(req, res);
      
      // Assert
      expect(Restaurant.find).toHaveBeenCalledWith({ owner: req.userId });
      expect(Order.find).toHaveBeenCalledWith({
        restaurant: { $in: mockRestaurants.map(r => r._id) }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });
    
    it('should return 403 when user is not an owner', async () => {
      // Arrange
      req.userRole = 'customer';
      
      // Act
      await orderController.getRestaurantOrders(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });
    
    it('should return 404 when no restaurants found', async () => {
      // Arrange
      req.userRole = 'owner';
      
      Restaurant.find.mockResolvedValue([]);
      
      // Act
      await orderController.getRestaurantOrders(req, res);
      
      // Assert
      expect(Restaurant.find).toHaveBeenCalledWith({ owner: req.userId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No restaurants found' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.userRole = 'owner';
      
      Restaurant.find.mockRejectedValue(new Error('Database error'));
      
      // Act
      await orderController.getRestaurantOrders(req, res);
      
      // Assert
      expect(Restaurant.find).toHaveBeenCalledWith({ owner: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
}); 