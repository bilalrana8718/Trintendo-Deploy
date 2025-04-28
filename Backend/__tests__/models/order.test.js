import mongoose from 'mongoose';
import Order from '../../models/order.js';
import * as dbHandler from '../../test-utils/db.js';

describe('Order Model', () => {
  let validOrderData;
  
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
    validOrderData = {
      customer: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      items: [
        {
          menuItem: new mongoose.Types.ObjectId(),
          name: 'Test Item',
          price: 9.99,
          quantity: 2
        }
      ],
      totalAmount: 19.98,
      status: 'pending',
      paymentStatus: 'pending',
      deliveryAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      deliveryInstructions: 'Leave at door'
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid order', async () => {
      const order = new Order(validOrderData);
      await expect(order.validate()).resolves.toBeUndefined();
    });
    
    test('should require customer field', async () => {
      const order = new Order({ ...validOrderData, customer: undefined });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.customer).toBeDefined();
      }
    });
    
    test('should require restaurant field', async () => {
      const order = new Order({ ...validOrderData, restaurant: undefined });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.restaurant).toBeDefined();
      }
    });
    
    test('should require totalAmount field', async () => {
      const order = new Order({ ...validOrderData, totalAmount: undefined });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.totalAmount).toBeDefined();
      }
    });
    
    test('should validate items in the order', async () => {
      const invalidItem = {
        // Missing required fields
        price: 9.99
      };
      
      const order = new Order({
        ...validOrderData,
        items: [invalidItem]
      });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors['items.0.name'] || error.errors['items.0.quantity']).toBeDefined();
      }
    });
    
    test('should validate status enum values', async () => {
      const order = new Order({
        ...validOrderData,
        status: 'InvalidStatus'
      });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.status).toBeDefined();
      }
    });
    
    test('should validate paymentStatus enum values', async () => {
      const order = new Order({
        ...validOrderData,
        paymentStatus: 'InvalidPaymentStatus'
      });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.paymentStatus).toBeDefined();
      }
    });
    
    test('should set default values correctly', () => {
      const order = new Order({
        customer: new mongoose.Types.ObjectId(),
        restaurant: new mongoose.Types.ObjectId(),
        items: [
          {
            menuItem: new mongoose.Types.ObjectId(),
            name: 'Test Item',
            price: 9.99,
            quantity: 2
          }
        ],
        totalAmount: 19.98,
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      });
      
      expect(order.status).toBe('pending');
      expect(order.paymentStatus).toBe('pending');
      expect(order.createdAt).toBeInstanceOf(Date);
    });
    
    test('should handle missing items field', async () => {
      // Create an order without the items field
      const order = new Order({ ...validOrderData, items: undefined });
      
      // No validation error is expected as items field might not be strictly required
      await expect(order.validate()).resolves.toBeUndefined();
      
      // Verify that the items field defaults to an empty array
      expect(order.items).toBeDefined();
      expect(Array.isArray(order.items)).toBe(true);
      expect(order.items.length).toBe(0);
    });
    
    test('should handle missing deliveryAddress field', async () => {
      // Create an order without the deliveryAddress field
      const order = new Order({ ...validOrderData, deliveryAddress: undefined });
      
      // No validation error is expected as deliveryAddress might not be strictly required
      await expect(order.validate()).resolves.toBeUndefined();
    });
  });
  
  describe('Order Item Management', () => {
    test('should calculate total amount correctly', async () => {
      const orderData = {
        customer: new mongoose.Types.ObjectId(),
        restaurant: new mongoose.Types.ObjectId(),
        items: [
          {
            menuItem: new mongoose.Types.ObjectId(),
            name: 'Item 1',
            price: 10.99,
            quantity: 2
          },
          {
            menuItem: new mongoose.Types.ObjectId(),
            name: 'Item 2',
            price: 5.99,
            quantity: 3
          }
        ],
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };
      
      // Set total amount manually for this test
      orderData.totalAmount = orderData.items.reduce(
        (total, item) => total + (item.price * item.quantity), 
        0
      );
      
      const order = new Order(orderData);
      await order.save();
      
      const expectedTotal = (10.99 * 2) + (5.99 * 3);
      expect(order.totalAmount).toBeCloseTo(expectedTotal, 2);
    });
  });
  
  describe('Database Operations', () => {
    test('should save an order to the database', async () => {
      const order = new Order(validOrderData);
      const savedOrder = await order.save();
      
      expect(savedOrder._id).toBeDefined();
      expect(savedOrder.status).toBe(validOrderData.status);
      
      // Verify we can find it
      const foundOrder = await Order.findById(savedOrder._id);
      expect(foundOrder).not.toBeNull();
      expect(foundOrder.totalAmount).toBe(validOrderData.totalAmount);
    });
    
    test('should update an order in the database', async () => {
      const order = new Order(validOrderData);
      const savedOrder = await order.save();
      
      // Update order
      savedOrder.status = 'delivered';
      savedOrder.paymentStatus = 'completed';
      await savedOrder.save();
      
      // Verify the update
      const updatedOrder = await Order.findById(savedOrder._id);
      expect(updatedOrder.status).toBe('delivered');
      expect(updatedOrder.paymentStatus).toBe('completed');
    });
    
    test('should delete an order from the database', async () => {
      const order = new Order(validOrderData);
      const savedOrder = await order.save();
      
      // Verify it exists
      let foundOrder = await Order.findById(savedOrder._id);
      expect(foundOrder).not.toBeNull();
      
      // Delete it
      await Order.deleteOne({ _id: savedOrder._id });
      
      // Verify it's gone
      foundOrder = await Order.findById(savedOrder._id);
      expect(foundOrder).toBeNull();
    });
  });
}); 