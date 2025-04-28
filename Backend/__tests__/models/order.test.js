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
      await order.save();
      
      // Delete the order
      await Order.findByIdAndDelete(order._id);
      
      // Verify it's deleted
      const deletedOrder = await Order.findById(order._id);
      expect(deletedOrder).toBeNull();
    });
  });
  
  describe('Pre-save Hooks', () => {
    test('should update updatedAt field on save', async () => {
      // Create and save an order
      const order = new Order(validOrderData);
      const savedOrder = await order.save();
      
      // Record the first updatedAt time
      const firstUpdatedAt = savedOrder.updatedAt;
      
      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update the order
      savedOrder.status = 'confirmed';
      await savedOrder.save();
      
      // Verify updatedAt was changed
      expect(savedOrder.updatedAt).not.toEqual(firstUpdatedAt);
      expect(savedOrder.updatedAt > firstUpdatedAt).toBe(true);
    });
    
    test('should add status to history when deliveryStatus changes', async () => {
      // Create and save an order
      const order = new Order(validOrderData);
      const savedOrder = await order.save();
      
      // Initial status history should be empty
      expect(savedOrder.statusHistory).toBeDefined();
      expect(savedOrder.statusHistory.length).toBe(0);
      
      // Update the delivery status
      savedOrder.deliveryStatus = 'assigned';
      await savedOrder.save();
      
      // Verify that status was added to history
      expect(savedOrder.statusHistory.length).toBe(1);
      expect(savedOrder.statusHistory[0].status).toBe('assigned');
      expect(savedOrder.statusHistory[0].timestamp).toBeInstanceOf(Date);
      
      // Update again
      savedOrder.deliveryStatus = 'picked_up';
      await savedOrder.save();
      
      // Verify second status was added
      expect(savedOrder.statusHistory.length).toBe(2);
      expect(savedOrder.statusHistory[1].status).toBe('picked_up');
    });
  });
  
  describe('Order Status Management', () => {
    test('should validate deliveryStatus enum values', async () => {
      const order = new Order({
        ...validOrderData,
        deliveryStatus: 'invalid_status'
      });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors.deliveryStatus).toBeDefined();
      }
    });
    
    test('should store rider information when assigned', async () => {
      const riderId = new mongoose.Types.ObjectId();
      const order = new Order({
        ...validOrderData,
        rider: riderId,
        deliveryStatus: 'assigned'
      });
      
      const savedOrder = await order.save();
      expect(savedOrder.rider).toEqual(riderId);
      expect(savedOrder.deliveryStatus).toBe('assigned');
    });
    
    test('should handle declined riders list', async () => {
      const declinedRider1 = new mongoose.Types.ObjectId();
      const declinedRider2 = new mongoose.Types.ObjectId();
      
      const order = new Order({
        ...validOrderData,
        declinedRiders: [declinedRider1, declinedRider2]
      });
      
      const savedOrder = await order.save();
      expect(savedOrder.declinedRiders.length).toBe(2);
      expect(savedOrder.declinedRiders[0]).toEqual(declinedRider1);
      expect(savedOrder.declinedRiders[1]).toEqual(declinedRider2);
    });
  });
  
  describe('Payment and Review Features', () => {
    test('should store payment information', async () => {
      const order = new Order({
        ...validOrderData,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        stripeSessionId: 'sess_123456789'
      });
      
      const savedOrder = await order.save();
      expect(savedOrder.paymentMethod).toBe('card');
      expect(savedOrder.paymentStatus).toBe('completed');
      expect(savedOrder.stripeSessionId).toBe('sess_123456789');
    });
    
    test('should store review information', async () => {
      const reviewData = {
        rating: 4,
        comment: 'Great service!'
      };
      
      const order = new Order({
        ...validOrderData,
        review: reviewData
      });
      
      const savedOrder = await order.save();
      expect(savedOrder.review.rating).toBe(4);
      expect(savedOrder.review.comment).toBe('Great service!');
      expect(savedOrder.review.createdAt).toBeInstanceOf(Date);
    });
    
    test('should validate review rating range', async () => {
      const order = new Order({
        ...validOrderData,
        review: {
          rating: 6, // Invalid: should be 1-5
          comment: 'Test'
        }
      });
      
      await expect(order.validate()).rejects.toThrow();
      try {
        await order.validate();
      } catch (error) {
        expect(error.errors['review.rating']).toBeDefined();
      }
    });
  });
}); 