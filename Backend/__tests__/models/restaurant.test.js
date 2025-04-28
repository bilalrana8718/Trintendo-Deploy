import mongoose from 'mongoose';
import * as dbHandler from '../../test-utils/db.js';
import Restaurant from '../../models/restaurant.js';

describe('Restaurant Model', () => {
  let validRestaurantData;
  let validMenuItemData;
  
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
    validMenuItemData = {
      name: 'Test Item',
      description: 'Delicious test item',
      price: 9.99,
      category: 'Main Course',
      image: 'test-item.jpg',
      isAvailable: true
    };
    
    validRestaurantData = {
      name: 'Test Restaurant',
      description: 'A test restaurant description',
      address: '123 Test St, Test City',
      phone: '1234567890',
      cuisine: 'Italian',
      image: 'test-restaurant.jpg',
      owner: new mongoose.Types.ObjectId(),
      menu: [validMenuItemData],
      isOpen: true
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
    
    test('should require cuisine field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, cuisine: undefined });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors.cuisine).toBeDefined();
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
    
    test('should not require description field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, description: undefined });
      await expect(restaurant.validate()).resolves.toBeUndefined();
    });
    
    test('should not require image field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, image: undefined });
      await expect(restaurant.validate()).resolves.toBeUndefined();
    });
    
    test('should not require menu field', async () => {
      const restaurant = new Restaurant({ ...validRestaurantData, menu: undefined });
      await expect(restaurant.validate()).resolves.toBeUndefined();
    });
    
    test('should set default values correctly', () => {
      const restaurant = new Restaurant({
        name: 'Test Restaurant',
        address: '123 Test St',
        phone: '1234567890',
        cuisine: 'Italian',
        owner: new mongoose.Types.ObjectId()
      });
      
      expect(restaurant.isOpen).toBe(true);
      expect(restaurant.createdAt).toBeInstanceOf(Date);
      expect(restaurant.menu).toEqual([]);
    });
  });
  
  describe('Menu Item Validation', () => {
    test('should validate a valid menu item', async () => {
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [validMenuItemData]
      });
      
      await expect(restaurant.validate()).resolves.toBeUndefined();
    });
    
    test('should require name field for menu item', async () => {
      const invalidMenuItem = { ...validMenuItemData, name: undefined };
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [invalidMenuItem]
      });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors['menu.0.name']).toBeDefined();
      }
    });
    
    test('should require price field for menu item', async () => {
      const invalidMenuItem = { ...validMenuItemData, price: undefined };
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [invalidMenuItem]
      });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors['menu.0.price']).toBeDefined();
      }
    });
    
    test('should require category field for menu item', async () => {
      const invalidMenuItem = { ...validMenuItemData, category: undefined };
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [invalidMenuItem]
      });
      
      await expect(restaurant.validate()).rejects.toThrow();
      try {
        await restaurant.validate();
      } catch (error) {
        expect(error.errors['menu.0.category']).toBeDefined();
      }
    });
    
    test('should set default values for menu item', () => {
      const menuItem = {
        name: 'Simple Item',
        price: 5.99,
        category: 'Side'
      };
      
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [menuItem]
      });
      
      expect(restaurant.menu[0].isAvailable).toBe(true);
    });
  });
  
  describe('Database Operations', () => {
    test('should save a restaurant to the database', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      const savedRestaurant = await restaurant.save();
      
      expect(savedRestaurant._id).toBeDefined();
      
      // Verify we can find it
      const foundRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(foundRestaurant).not.toBeNull();
      expect(foundRestaurant.name).toBe(validRestaurantData.name);
    });
    
    test('should update a restaurant in the database', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      const savedRestaurant = await restaurant.save();
      
      // Update restaurant
      savedRestaurant.name = 'Updated Restaurant';
      savedRestaurant.cuisine = 'Mexican';
      savedRestaurant.isOpen = false;
      await savedRestaurant.save();
      
      // Verify the update
      const updatedRestaurant = await Restaurant.findById(savedRestaurant._id);
      expect(updatedRestaurant.name).toBe('Updated Restaurant');
      expect(updatedRestaurant.cuisine).toBe('Mexican');
      expect(updatedRestaurant.isOpen).toBe(false);
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
  
  describe('Menu Management', () => {
    test('should add menu items to restaurant', async () => {
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [] // Start with empty menu
      });
      
      // Add item
      restaurant.menu.push(validMenuItemData);
      await restaurant.save();
      
      // Verify item was added
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.menu.length).toBe(1);
      expect(updatedRestaurant.menu[0].name).toBe(validMenuItemData.name);
      
      // Add another item
      const secondItem = {
        name: 'Second Item',
        description: 'Another delicious item',
        price: 14.99,
        category: 'Dessert',
        image: 'dessert.jpg'
      };
      
      updatedRestaurant.menu.push(secondItem);
      await updatedRestaurant.save();
      
      // Verify second item was added
      const finalRestaurant = await Restaurant.findById(restaurant._id);
      expect(finalRestaurant.menu.length).toBe(2);
      expect(finalRestaurant.menu[1].name).toBe(secondItem.name);
    });
    
    test('should update menu items in restaurant', async () => {
      const restaurant = new Restaurant(validRestaurantData);
      await restaurant.save();
      
      // Update menu item
      restaurant.menu[0].price = 12.99;
      restaurant.menu[0].isAvailable = false;
      await restaurant.save();
      
      // Verify update
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.menu[0].price).toBe(12.99);
      expect(updatedRestaurant.menu[0].isAvailable).toBe(false);
    });
    
    test('should remove menu items from restaurant', async () => {
      // Create restaurant with two menu items
      const restaurant = new Restaurant({
        ...validRestaurantData,
        menu: [
          validMenuItemData,
          {
            name: 'Second Item',
            description: 'Another item',
            price: 14.99,
            category: 'Dessert'
          }
        ]
      });
      
      await restaurant.save();
      expect(restaurant.menu.length).toBe(2);
      
      // Remove first item
      restaurant.menu.splice(0, 1);
      await restaurant.save();
      
      // Verify item was removed
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.menu.length).toBe(1);
      expect(updatedRestaurant.menu[0].name).toBe('Second Item');
    });
  });
}); 