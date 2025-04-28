import mongoose from 'mongoose';
import * as dbHandler from '../../test-utils/db.js';
import Cart from '../../models/cart.js';

describe('Cart Model', () => {
  let validCartData;
  
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
  
  beforeEach(() => {
    validCartData = {
      customer: new mongoose.Types.ObjectId(),
      items: [
        {
          menuItem: new mongoose.Types.ObjectId(),
          name: 'Test Item',
          price: 9.99,
          quantity: 2,
          restaurant: new mongoose.Types.ObjectId(),
          restaurantName: 'Test Restaurant'
        }
      ]
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid cart', async () => {
      const cart = new Cart(validCartData);
      await expect(cart.validate()).resolves.toBeUndefined();
    });
    
    test('should require customer field', async () => {
      const cart = new Cart({ ...validCartData, customer: undefined });
      
      await expect(cart.validate()).rejects.toThrow();
      try {
        await cart.validate();
      } catch (error) {
        expect(error.errors.customer).toBeDefined();
      }
    });
    
    test('should set default values correctly', () => {
      const cart = new Cart({
        customer: new mongoose.Types.ObjectId()
      });
      
      expect(cart.items).toEqual([]);
      expect(cart.createdAt).toBeInstanceOf(Date);
    });
  });
  
  describe('Database Operations', () => {
    test('should save a cart to the database', async () => {
      const cart = new Cart(validCartData);
      const savedCart = await cart.save();
      
      expect(savedCart._id).toBeDefined();
      
      // Verify we can find it
      const foundCart = await Cart.findById(savedCart._id);
      expect(foundCart).not.toBeNull();
      expect(foundCart.customer.toString()).toBe(validCartData.customer.toString());
    });
    
    test('should update a cart in the database', async () => {
      const cart = new Cart(validCartData);
      const savedCart = await cart.save();
      
      // Update cart - add new item
      const newItem = {
        menuItem: new mongoose.Types.ObjectId(),
        name: 'New Test Item',
        price: 14.99,
        quantity: 1,
        restaurant: validCartData.items[0].restaurant,
        restaurantName: 'Test Restaurant'
      };
      
      savedCart.items.push(newItem);
      await savedCart.save();
      
      // Verify the update
      const updatedCart = await Cart.findById(savedCart._id);
      expect(updatedCart.items.length).toBe(2);
      expect(updatedCart.items[1].name).toBe('New Test Item');
    });
    
    test('should delete a cart from the database', async () => {
      const cart = new Cart(validCartData);
      const savedCart = await cart.save();
      
      // Verify it exists
      let foundCart = await Cart.findById(savedCart._id);
      expect(foundCart).not.toBeNull();
      
      // Delete it
      await Cart.deleteOne({ _id: savedCart._id });
      
      // Verify it's gone
      foundCart = await Cart.findById(savedCart._id);
      expect(foundCart).toBeNull();
    });
  });
  
  describe('Cart Item Management', () => {
    test('should add items to the cart', async () => {
      const cart = new Cart({
        customer: new mongoose.Types.ObjectId(),
        items: []
      });
      
      // Add items
      cart.items.push({
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Item 1',
        price: 9.99,
        quantity: 2,
        restaurant: new mongoose.Types.ObjectId(),
        restaurantName: 'Test Restaurant'
      });
      
      await cart.save();
      expect(cart.items.length).toBe(1);
      
      // Add another item
      cart.items.push({
        menuItem: new mongoose.Types.ObjectId(),
        name: 'Item 2',
        price: 14.99,
        quantity: 1,
        restaurant: cart.items[0].restaurant,
        restaurantName: 'Test Restaurant'
      });
      
      await cart.save();
      expect(cart.items.length).toBe(2);
    });
    
    test('should remove items from the cart', async () => {
      const cart = new Cart({
        customer: new mongoose.Types.ObjectId(),
        items: [
          {
            menuItem: new mongoose.Types.ObjectId(),
            name: 'Item 1',
            price: 9.99,
            quantity: 2,
            restaurant: new mongoose.Types.ObjectId(),
            restaurantName: 'Test Restaurant'
          },
          {
            menuItem: new mongoose.Types.ObjectId(),
            name: 'Item 2',
            price: 14.99,
            quantity: 1,
            restaurant: new mongoose.Types.ObjectId(),
            restaurantName: 'Test Restaurant'
          }
        ]
      });
      
      await cart.save();
      expect(cart.items.length).toBe(2);
      
      // Remove the first item
      cart.items.splice(0, 1);
      await cart.save();
      
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].name).toBe('Item 2');
    });
    
    test('should update item quantity', async () => {
      const cart = new Cart(validCartData);
      await cart.save();
      
      // Update quantity
      cart.items[0].quantity = 5;
      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id);
      expect(updatedCart.items[0].quantity).toBe(5);
    });
    
    test('should clear all items from the cart', async () => {
      const cart = new Cart(validCartData);
      await cart.save();
      
      expect(cart.items.length).toBe(1);
      
      // Clear items
      cart.items = [];
      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id);
      expect(updatedCart.items.length).toBe(0);
    });
  });
}); 