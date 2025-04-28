import mongoose from 'mongoose';
import Restaurant from '../../models/restaurant.js';
import * as dbHandler from '../../test-utils/db.js';

describe('Restaurant Model', () => {
  let validRestaurantData;
  
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
    validRestaurantData = {
      name: 'Test Restaurant',
      address: '123 Food St, Culinary City',
      phone: '1234567890',
      cuisine: 'Italian',
      owner: new mongoose.Types.ObjectId(),
      description: 'A fantastic Italian restaurant with authentic dishes',
      image: 'https://example.com/restaurant.jpg'
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid restaurant', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      await expect(restaurant.validate()).resolves.toBeUndefined();
    });
    
    test('should require name field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, name: undefined });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors.name).toBeDefined();
      }
    });
    
    test('should require address field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, address: undefined });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors.address).toBeDefined();
      }
    });
    
    test('should require phone field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, phone: undefined });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors.phone).toBeDefined();
      }
    });
    
    test('should require owner field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, owner: undefined });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors.owner).toBeDefined();
      }
    });
    
    test('should set default values correctly', () => {
      const restaurant = new Restaurant({
        name: 'Test Restaurant',
        address: '123 Food St',
        phone: '1234567890',
        cuisine: 'Italian',
        owner: new mongoose.Types.ObjectId()
      });
      
      expect(restaurant.isOpen).toBe(true);
      expect(restaurant.createdAt).toBeInstanceOf(Date);
    });
  });
  
  describe('Database Operations', () => {
    test('should save a restaurant to the database', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      const savedRestaurant = await restaurant.save();
      
      expect(savedRestaurant._id).toBeDefined();
      expect(savedRestaurant.name).toBe(validRestaurantData.name);
      
      // Verify we can find it
      const foundRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(foundRestaurant).not.toBeNull();
      expect(foundRestaurant.cuisine).toEqual(validRestaurantData.cuisine);
    });
    
    test('should update a restaurant in the database', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      const savedRestaurant = await restaurant.save();
      
      // Update restaurant
      savedRestaurant.name = 'Updated Restaurant Name';
      savedRestaurant.cuisine = 'Italian, Pizza, Pasta';
      await savedRestaurant.save();
      
      // Verify the update
      const updatedRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(updatedRestaurant.name).toBe('Updated Restaurant Name');
      expect(updatedRestaurant.cuisine).toEqual('Italian, Pizza, Pasta');
    });
    
    test('should delete a restaurant from the database', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      const savedRestaurant = await restaurant.save();
      
      // Verify it exists
      let foundRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(foundRestaurant).not.toBeNull();
      
      // Delete it
      await Restaurant.deleteOne({ _id: savedRestaurant._id });
      
      // Verify it's gone
      foundRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(foundRestaurant).toBeNull();
    });
  });
}); 