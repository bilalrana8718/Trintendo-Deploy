import mongoose from 'mongoose';
import * as dbHandler from '../../test-utils/db.js';
import * as cartController from '../../controllers/cart.controller.js';
import Cart from '../../models/cart.js';
import Restaurant from '../../models/restaurant.js';

// Mock the cart and restaurant models
jest.mock('../../models/cart.js', () => {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
  };
});

jest.mock('../../models/restaurant.js', () => {
  return {
    findById: jest.fn(),
  };
});

describe('Cart Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      params: {},
      userId: 'mockUserId'
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
  });
  
  // Clear database between tests
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  
  // Close database connection after all tests
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });
  
  describe('getCart', () => {
    it('should return existing cart when found', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [{ name: 'Test Item', price: 10, quantity: 1 }]
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.getCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });
    
    it.skip('should create a new cart when none exists', async () => {
      // Arrange
      const mockNewCart = {
        customer: req.userId,
        items: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cart.findOne.mockResolvedValue(null);
      
      // Directly mock the Cart constructor function
      const originalCart = global.Cart;
      global.Cart = jest.fn().mockImplementation(() => mockNewCart);
      
      // Act
      await cartController.getCart(req, res);
      
      // Restore the original Cart
      global.Cart = originalCart;
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(mockNewCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockNewCart);
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      Cart.findOne.mockRejectedValue(new Error('Database error'));
      
      // Act
      await cartController.getCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: 'Database error'
      });
    });
  });
  
  describe('addToCart', () => {
    it('should add a new item to empty cart', async () => {
      // Arrange
      const mockMenuItem = {
        _id: 'menuItemId',
        name: 'Test Item',
        price: 10,
        isAvailable: true,
      };
      
      const mockRestaurant = {
        _id: 'restaurantId',
        name: 'Test Restaurant',
        menu: {
          id: jest.fn().mockReturnValue(mockMenuItem)
        }
      };
      
      const mockCart = {
        customer: req.userId,
        items: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.body = {
        restaurantId: 'restaurantId',
        menuItemId: 'menuItemId',
        quantity: 2
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.addToCart(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('restaurantId');
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith('menuItemId');
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(mockCart.items.length).toBe(1);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });
    
    it('should return 404 when restaurant not found', async () => {
      // Arrange
      req.body = {
        restaurantId: 'nonExistentId',
        menuItemId: 'menuItemId',
        quantity: 1
      };
      
      Restaurant.findById.mockResolvedValue(null);
      
      // Act
      await cartController.addToCart(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('nonExistentId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Restaurant not found' });
    });
    
    it('should return 404 when menu item not found', async () => {
      // Arrange
      const mockRestaurant = {
        _id: 'restaurantId',
        menu: {
          id: jest.fn().mockReturnValue(null)
        }
      };
      
      req.body = {
        restaurantId: 'restaurantId',
        menuItemId: 'nonExistentId',
        quantity: 1
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await cartController.addToCart(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('restaurantId');
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith('nonExistentId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Menu item not found' });
    });
    
    it('should return 400 when menu item is unavailable', async () => {
      // Arrange
      const mockMenuItem = {
        _id: 'menuItemId',
        name: 'Test Item',
        price: 10,
        isAvailable: false
      };
      
      const mockRestaurant = {
        _id: 'restaurantId',
        menu: {
          id: jest.fn().mockReturnValue(mockMenuItem)
        }
      };
      
      req.body = {
        restaurantId: 'restaurantId',
        menuItemId: 'menuItemId',
        quantity: 1
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      
      // Act
      await cartController.addToCart(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('restaurantId');
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith('menuItemId');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'This item is currently unavailable' });
    });
    
    it('should return 400 when adding item from different restaurant', async () => {
      // Arrange
      const mockMenuItem = {
        _id: 'menuItemId',
        name: 'Test Item',
        price: 10,
        isAvailable: true
      };
      
      const mockRestaurant = {
        _id: 'restaurantId',
        name: 'Test Restaurant',
        menu: {
          id: jest.fn().mockReturnValue(mockMenuItem)
        }
      };
      
      const mockCart = {
        customer: req.userId,
        items: [{
          restaurant: {
            toString: jest.fn().mockReturnValue('differentRestaurantId')
          }
        }]
      };
      
      req.body = {
        restaurantId: 'restaurantId',
        menuItemId: 'menuItemId',
        quantity: 1
      };
      
      Restaurant.findById.mockResolvedValue(mockRestaurant);
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.addToCart(req, res);
      
      // Assert
      expect(Restaurant.findById).toHaveBeenCalledWith('restaurantId');
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith('menuItemId');
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Your cart contains items from a different restaurant. Clear your cart before adding items from a new restaurant.' 
      });
    });
  });
  
  describe('updateCartItem', () => {
    it('should update item quantity in cart', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [{
          _id: {
            toString: jest.fn().mockReturnValue('itemId')
          },
          name: 'Test Item',
          price: 10,
          quantity: 1
        }],
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.body = {
        itemId: 'itemId',
        quantity: 3
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.updateCartItem(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(mockCart.items[0].quantity).toBe(3);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });
    
    it('should return 400 when quantity is less than 1', async () => {
      // Arrange
      req.body = {
        itemId: 'itemId',
        quantity: 0
      };
      
      // Act
      await cartController.updateCartItem(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quantity must be at least 1' });
    });
    
    it('should return 404 when cart not found', async () => {
      // Arrange
      req.body = {
        itemId: 'itemId',
        quantity: 2
      };
      
      Cart.findOne.mockResolvedValue(null);
      
      // Act
      await cartController.updateCartItem(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });
    
    it('should return 404 when item not found in cart', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [{
          _id: {
            toString: jest.fn().mockReturnValue('differentItemId')
          }
        }]
      };
      
      req.body = {
        itemId: 'itemId',
        quantity: 2
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.updateCartItem(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found in cart' });
    });
  });
  
  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [
          {
            _id: {
              toString: jest.fn().mockReturnValue('itemId')
            },
            name: 'Test Item 1'
          },
          {
            _id: {
              toString: jest.fn().mockReturnValue('itemId2')
            },
            name: 'Test Item 2'
          }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      
      req.params = {
        itemId: 'itemId'
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.removeFromCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(mockCart.items.length).toBe(1);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCart);
    });
    
    it('should return 404 when cart not found', async () => {
      // Arrange
      req.params = {
        itemId: 'itemId'
      };
      
      Cart.findOne.mockResolvedValue(null);
      
      // Act
      await cartController.removeFromCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });
  });
  
  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      // Arrange
      const mockCart = {
        customer: req.userId,
        items: [
          { name: 'Test Item 1' },
          { name: 'Test Item 2' }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      
      Cart.findOne.mockResolvedValue(mockCart);
      
      // Act
      await cartController.clearCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(mockCart.items.length).toBe(0);
      expect(mockCart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cart cleared successfully',
        cart: mockCart
      });
    });
    
    it('should return 404 when cart not found', async () => {
      // Arrange
      Cart.findOne.mockResolvedValue(null);
      
      // Act
      await cartController.clearCart(req, res);
      
      // Assert
      expect(Cart.findOne).toHaveBeenCalledWith({ customer: req.userId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found' });
    });
  });
}); 