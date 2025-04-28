import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as restaurantController from '../../controllers/restaurants.controller.js';

// Mock the Restaurant model
jest.mock('../../models/restaurant.js', () => {
  const mockModel = jest.fn().mockImplementation((data) => {
    const instance = { ...data };
    Object.defineProperty(instance, 'save', {
      enumerable: false,
      value: jest.fn().mockResolvedValue(instance)
    });
    return instance;
  });
  
  // Add static methods
  mockModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue([])
  });
  mockModel.findById = jest.fn();
  mockModel.findByIdAndUpdate = jest.fn();
  
  return mockModel;
});

// Get the mocked Restaurant model
import Restaurant from '../../models/restaurant.js';

describe('Restaurant Controller', () => {
  let mongoServer;
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
    
    // Setup specific mock implementations for sort method
    Restaurant.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Restaurant' }])
    });
  });

  // Connect to in-memory database before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  describe('createRestaurant', () => {
    it('should create a new restaurant and return 201', async () => {
      // Arrange
      req.body = {
        name: 'Test Restaurant',
        description: 'Test Description',
        address: '123 Test St',
        phone: '1234567890',
        cuisine: 'Italian',
        image: 'testimage.jpg'
      };
      
      const mockSavedRestaurant = {
        ...req.body,
        _id: 'mockRestaurantId',
        owner: req.userId,
        menu: []
      };
      
      // Mock the save method for this test
      const mockSave = jest.fn().mockResolvedValue(mockSavedRestaurant);
      Restaurant.mockImplementation((data) => {
        const instance = {
          _id: 'mockRestaurantId',
          ...data
        };
        Object.defineProperty(instance, 'save', {
          enumerable: false,
          value: mockSave
        });
        return instance;
      });
      
      // Act
      await restaurantController.createRestaurant(req, res);
      
      // Assert
      expect(Restaurant).toHaveBeenCalledWith({
        ...req.body,
        owner: req.userId,
        menu: []
      });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedRestaurant);
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.body = {
        name: 'Test Restaurant',
        description: 'Test Description'
      };
      
      // Mock Restaurant save with error
      const errorMessage = 'Database error';
      const mockSave = jest.fn().mockRejectedValue(new Error(errorMessage));
      Restaurant.mockImplementation(() => {
        const instance = {};
        Object.defineProperty(instance, 'save', {
          enumerable: false,
          value: mockSave
        });
        return instance;
      });
      
      // Act
      await restaurantController.createRestaurant(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Something went wrong",
        error: errorMessage
      });
    });
  });
  
  describe('getAllRestaurants', () => {
    it('should return all restaurants when no cuisine filter is applied', async () => {
      // Arrange
      const mockRestaurants = [
        { id: '1', name: 'Restaurant 1' },
        { id: '2', name: 'Restaurant 2' }
      ];
      
      Restaurant.find().sort.mockResolvedValue(mockRestaurants);
      
      // Act
      await restaurantController.getAllRestaurants(req, res);
      
      // Assert
      expect(Restaurant.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should filter restaurants by cuisine', async () => {
      // Arrange
      const mockRestaurants = [
        { id: '1', name: 'Restaurant 1', cuisine: 'Italian' }
      ];
      
      req.query = { cuisine: 'Italian' };
      
      Restaurant.find().sort.mockResolvedValue(mockRestaurants);
      
      // Act
      await restaurantController.getAllRestaurants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return all restaurants when cuisine filter is "All"', async () => {
      // Arrange
      const mockRestaurants = [
        { id: '1', name: 'Restaurant 1' },
        { id: '2', name: 'Restaurant 2' }
      ];
      
      req.query = { cuisine: 'All' };
      
      Restaurant.find().sort.mockResolvedValue(mockRestaurants);
      
      // Act
      await restaurantController.getAllRestaurants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Restaurant.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await restaurantController.getAllRestaurants(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('getRestaurantsByOwner', () => {
    it('should return restaurants owned by the user', async () => {
      // Arrange
      const mockRestaurants = [
        { id: '1', name: 'Restaurant 1', owner: req.userId }
      ];
      
      Restaurant.find().sort.mockResolvedValue(mockRestaurants);
      
      // Act
      await restaurantController.getRestaurantsByOwner(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Restaurant.find.mockImplementation(() => {
        throw new Error('Database error');
      });
      
      // Act
      await restaurantController.getRestaurantsByOwner(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('getRestaurantById', () => {
    it('should return a restaurant by ID', async () => {
      // Arrange
      const mockRestaurant = { id: '123', name: 'Restaurant 1' };
      req.params.id = '123';
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.getRestaurantById(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if restaurant not found', async () => {
      // Arrange
      req.params.id = '123';
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await restaurantController.getRestaurantById(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = '123';
      
      Restaurant.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await restaurantController.getRestaurantById(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('updateRestaurant', () => {
    it('should update a restaurant and return 200', async () => {
      // Arrange
      req.params.id = '123';
      req.body = {
        name: 'Updated Restaurant',
        description: 'Updated Description',
        isOpen: true
      };
      
      const mockRestaurant = {
        _id: '123',
        owner: req.userId,
        toString: jest.fn().mockReturnValue(req.userId)
      };
      
      const updatedRestaurant = {
        ...mockRestaurant,
        ...req.body
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      Restaurant.findByIdAndUpdate.mockResolvedValue(updatedRestaurant);
      
      // Act
      await restaurantController.updateRestaurant(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        req.body,
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if restaurant not found', async () => {
      // Arrange
      req.params.id = '123';
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await restaurantController.updateRestaurant(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 403 if user is not the owner', async () => {
      // Arrange
      req.params.id = '123';
      req.userId = 'user1';
      
      const mockRestaurant = {
        _id: '123',
        owner: 'differentUserId',
        toString: jest.fn().mockReturnValue('differentUserId')
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.updateRestaurant(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = '123';
      
      Restaurant.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await restaurantController.updateRestaurant(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('addMenuItem', () => {
    it('should add a menu item and return 201', async () => {
      // Arrange
      req.params.id = '123';
      req.body = {
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99,
        category: 'Main',
        image: 'pizza.jpg'
      };
      
      const mockRestaurant = {
        _id: '123',
        owner: req.userId,
        menu: [],
        toString: jest.fn().mockReturnValue(req.userId),
        save: jest.fn().mockResolvedValue({
          _id: '123',
          owner: req.userId,
          menu: [req.body]
        })
      };
      
      mockRestaurant.menu.push = jest.fn();
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.addMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(mockRestaurant.menu.push).toHaveBeenCalledWith(req.body);
      expect(mockRestaurant.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if restaurant not found', async () => {
      // Arrange
      req.params.id = '123';
      req.body = {
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99
      };
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await restaurantController.addMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 403 if user is not the owner', async () => {
      // Arrange
      req.params.id = '123';
      req.body = {
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99
      };
      
      const mockRestaurant = {
        _id: '123',
        owner: 'differentUserId',
        toString: jest.fn().mockReturnValue('differentUserId')
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.addMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = '123';
      req.body = {
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99
      };
      
      Restaurant.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await restaurantController.addMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('updateMenuItem', () => {
    it('should update a menu item and return 200', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      req.body = {
        name: 'Updated Pizza',
        price: 14.99,
        isAvailable: false
      };
      
      const originalMenuItem = {
        _id: 'item123',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12.99,
        category: 'Main',
        image: 'pizza.jpg',
        isAvailable: true
      };
      
      const updatedMenuItem = {
        ...originalMenuItem,
        ...req.body
      };
      
      const mockRestaurant = {
        _id: '123',
        owner: req.userId,
        menu: [originalMenuItem],
        toString: jest.fn().mockReturnValue(req.userId),
        save: jest.fn().mockResolvedValue({
          _id: '123',
          owner: req.userId,
          menu: [updatedMenuItem]
        })
      };
      
      mockRestaurant.menu.findIndex = jest.fn().mockReturnValue(0);
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.updateMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(mockRestaurant.menu.findIndex).toHaveBeenCalled();
      expect(mockRestaurant.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if restaurant not found', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await restaurantController.updateMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 403 if user is not the owner', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      const mockRestaurant = {
        _id: '123',
        owner: 'differentUserId',
        toString: jest.fn().mockReturnValue('differentUserId')
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.updateMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if menu item not found', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'nonExistentItemId';
      
      const mockRestaurant = {
        _id: '123',
        owner: req.userId,
        menu: [{
          _id: 'differentItemId',
          name: 'Pizza'
        }],
        toString: jest.fn().mockReturnValue(req.userId)
      };
      
      mockRestaurant.menu.findIndex = jest.fn().mockReturnValue(-1);
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.updateMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(mockRestaurant.menu.findIndex).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      Restaurant.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await restaurantController.updateMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
  
  describe('deleteMenuItem', () => {
    it('should delete a menu item and return 200', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      const menuItem = {
        _id: {
          toString: jest.fn().mockReturnValue('item123')
        },
        name: 'Pizza'
      };
      
      const mockRestaurant = {
        _id: '123',
        owner: req.userId,
        menu: [menuItem],
        toString: jest.fn().mockReturnValue(req.userId),
        save: jest.fn().mockResolvedValue({
          _id: '123',
          owner: req.userId,
          menu: []
        })
      };
      
      // Mock filter to return an empty array
      mockRestaurant.menu.filter = jest.fn().mockReturnValue([]);
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.deleteMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(mockRestaurant.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 404 if restaurant not found', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await restaurantController.deleteMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should return 403 if user is not the owner', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      const mockRestaurant = {
        _id: '123',
        owner: 'differentUserId',
        toString: jest.fn().mockReturnValue('differentUserId')
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await restaurantController.deleteMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalled();
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      req.params.id = '123';
      req.params.itemId = 'item123';
      
      Restaurant.findById.mockRejectedValue(new Error('Database error'));
      
      // Act
      await restaurantController.deleteMenuItem(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
    });
  });
}); 