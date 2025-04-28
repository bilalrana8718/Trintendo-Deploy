import mongoose from 'mongoose';
import * as dbHandler from '../../test-utils/db.js';
import Rider from '../../models/rider.js';

describe('Rider Model', () => {
  let validRiderData;
  
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
    validRiderData = {
      user: new mongoose.Types.ObjectId(),
      name: 'Test Rider',
      phone: '1234567890',
      email: 'testrider@example.com',
      vehicleType: 'motorcycle',
      vehicleNumber: 'AB1234',
      currentLocation: {
        type: 'Point',
        coordinates: [73.856, 18.516]
      }
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid rider', async () => {
      const rider = new Rider(validRiderData);
      await expect(rider.validate()).resolves.toBeUndefined();
    });
    
    test('should require user field', async () => {
      const rider = new Rider({ ...validRiderData, user: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.user).toBeDefined();
      }
    });
    
    test('should require name field', async () => {
      const rider = new Rider({ ...validRiderData, name: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.name).toBeDefined();
      }
    });
    
    test('should require phone field', async () => {
      const rider = new Rider({ ...validRiderData, phone: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.phone).toBeDefined();
      }
    });
    
    test('should require email field', async () => {
      const rider = new Rider({ ...validRiderData, email: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.email).toBeDefined();
      }
    });
    
    test('should require vehicleType field', async () => {
      const rider = new Rider({ ...validRiderData, vehicleType: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.vehicleType).toBeDefined();
      }
    });
    
    test('should require vehicleNumber field', async () => {
      const rider = new Rider({ ...validRiderData, vehicleNumber: undefined });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.vehicleNumber).toBeDefined();
      }
    });
    
    test('should validate vehicleType enum values', async () => {
      const rider = new Rider({
        ...validRiderData,
        vehicleType: 'invalid_type'
      });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.vehicleType).toBeDefined();
      }
    });
    
    test('should validate status enum values', async () => {
      const rider = new Rider({
        ...validRiderData,
        status: 'invalid_status'
      });
      
      await expect(rider.validate()).rejects.toThrow();
      try {
        await rider.validate();
      } catch (error) {
        expect(error.errors.status).toBeDefined();
      }
    });
    
    test('should set default values correctly', () => {
      const rider = new Rider(validRiderData);
      
      expect(rider.status).toBe('offline');
      expect(rider.rating).toBe(0);
      expect(rider.totalDeliveries).toBe(0);
      expect(rider.isVerified).toBe(false);
      expect(rider.createdAt).toBeInstanceOf(Date);
      expect(rider.updatedAt).toBeInstanceOf(Date);
    });
    
    test('should validate rating range', async () => {
      // Test rating below minimum
      const riderWithLowRating = new Rider({
        ...validRiderData,
        rating: -1
      });
      
      await expect(riderWithLowRating.validate()).rejects.toThrow();
      
      // Test rating above maximum
      const riderWithHighRating = new Rider({
        ...validRiderData,
        rating: 6
      });
      
      await expect(riderWithHighRating.validate()).rejects.toThrow();
      
      // Test valid rating
      const riderWithValidRating = new Rider({
        ...validRiderData,
        rating: 4.5
      });
      
      await expect(riderWithValidRating.validate()).resolves.toBeUndefined();
    });
  });
  
  describe('Hooks', () => {
    test('should update updatedAt field when saving', async () => {
      const rider = new Rider(validRiderData);
      const originalDate = rider.updatedAt;
      
      // Wait a bit to ensure date difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await rider.save();
      const newDate = rider.updatedAt;
      
      expect(newDate.getTime()).toBeGreaterThan(originalDate.getTime());
    });
  });
  
  describe('Database Operations', () => {
    test('should save a rider to the database', async () => {
      const rider = new Rider(validRiderData);
      const savedRider = await rider.save();
      
      expect(savedRider._id).toBeDefined();
      
      // Verify we can find it
      const foundRider = await Rider.findById(savedRider._id);
      expect(foundRider).not.toBeNull();
      expect(foundRider.name).toBe(validRiderData.name);
      expect(foundRider.email).toBe(validRiderData.email);
    });
    
    test('should update a rider in the database', async () => {
      const rider = new Rider(validRiderData);
      const savedRider = await rider.save();
      
      // Update rider
      savedRider.name = 'Updated Name';
      savedRider.status = 'available';
      savedRider.totalDeliveries = 5;
      await savedRider.save();
      
      // Verify the update
      const updatedRider = await Rider.findById(savedRider._id);
      expect(updatedRider.name).toBe('Updated Name');
      expect(updatedRider.status).toBe('available');
      expect(updatedRider.totalDeliveries).toBe(5);
    });
    
    test('should delete a rider from the database', async () => {
      const rider = new Rider(validRiderData);
      const savedRider = await rider.save();
      
      // Verify it exists
      let foundRider = await Rider.findById(savedRider._id);
      expect(foundRider).not.toBeNull();
      
      // Delete it
      await Rider.deleteOne({ _id: savedRider._id });
      
      // Verify it's gone
      foundRider = await Rider.findById(savedRider._id);
      expect(foundRider).toBeNull();
    });
    
    test('should enforce email uniqueness', async () => {
      // Create first rider
      const rider1 = new Rider(validRiderData);
      await rider1.save();
      
      // Try to create another rider with the same email
      const rider2 = new Rider({
        ...validRiderData,
        user: new mongoose.Types.ObjectId() // Different user
      });
      
      // This should fail with a duplicate key error
      await expect(rider2.save()).rejects.toThrow();
    });
    
    test('should enforce user uniqueness', async () => {
      // Create first rider
      const rider1 = new Rider(validRiderData);
      await rider1.save();
      
      // Try to create another rider with the same user
      const rider2 = new Rider({
        ...validRiderData,
        email: 'different@example.com' // Different email
      });
      
      // This should fail with a duplicate key error
      await expect(rider2.save()).rejects.toThrow();
    });
  });
  
  describe('Geospatial Features', () => {
    test('should store and retrieve location coordinates', async () => {
      const rider = new Rider({
        ...validRiderData,
        currentLocation: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Mumbai coordinates
        }
      });
      
      await rider.save();
      
      const foundRider = await Rider.findById(rider._id);
      expect(foundRider.currentLocation.type).toBe('Point');
      expect(foundRider.currentLocation.coordinates).toEqual([72.8777, 19.0760]);
    });
    
    test('should update rider location', async () => {
      const rider = new Rider(validRiderData);
      await rider.save();
      
      // Update location
      rider.currentLocation = {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Delhi coordinates
      };
      await rider.save();
      
      // Verify the update
      const updatedRider = await Rider.findById(rider._id);
      expect(updatedRider.currentLocation.coordinates).toEqual([77.2090, 28.6139]);
    });
  });
}); 