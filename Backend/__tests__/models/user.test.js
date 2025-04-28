import mongoose from 'mongoose';
import User from '../../models/user.js';
import * as dbHandler from '../../test-utils/db.js';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  let validUserData;
  
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
    validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'owner',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'Test Country'
      }
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid user', async () => {
      const user = new User(validUserData);
      await expect(user.validate()).resolves.toBeUndefined();
    });
    
    test('should require name field', async () => {
      const user = new User({ ...validUserData, name: undefined });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.name).toBeDefined();
      }
    });
    
    test('should require email field', async () => {
      const user = new User({ ...validUserData, email: undefined });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.email).toBeDefined();
      }
    });
    
    test('should require password field', async () => {
      const user = new User({ ...validUserData, password: undefined });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });
    
    test('should validate role enum values', async () => {
      const user = new User({
        ...validUserData,
        role: 'invalid-role'
      });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.role).toBeDefined();
      }
    });
    
    test('should validate password length', async () => {
      const user = new User({
        ...validUserData,
        password: 'short'
      });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });
  });
  
  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      // Password should be hashed
      expect(savedUser.password).not.toBe(validUserData.password);
      // Verify hash is valid
      const isMatch = await bcrypt.compare(validUserData.password, savedUser.password);
      expect(isMatch).toBe(true);
    });
    
    test('should not rehash password if not modified', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      const passwordAfterFirstSave = savedUser.password;
      
      // Update a field other than password
      savedUser.name = 'Updated Name';
      await savedUser.save();
      
      // Password hash should remain the same
      expect(savedUser.password).toBe(passwordAfterFirstSave);
    });
    
    test('should hash password if modified', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      const passwordAfterFirstSave = savedUser.password;
      
      // Update password
      savedUser.password = 'NewPassword123!';
      await savedUser.save();
      
      // Password hash should be different
      expect(savedUser.password).not.toBe(passwordAfterFirstSave);
      // Verify new hash is valid
      const isMatch = await bcrypt.compare('NewPassword123!', savedUser.password);
      expect(isMatch).toBe(true);
    });
  });
  
  describe('Database Operations', () => {
    test('should save a user to the database', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(validUserData.name);
      expect(savedUser.email).toBe(validUserData.email);
      
      // Verify we can find it
      const foundUser = await User.findById(savedUser._id);
      expect(foundUser).not.toBeNull();
      expect(foundUser.role).toBe(validUserData.role);
    });
    
    test('should enforce unique email addresses', async () => {
      // Save first user
      const user1 = new User(validUserData);
      await user1.save();
      
      // Try to save second user with same email
      const user2 = new User({
        ...validUserData,
        name: 'Another Test User'
      });
      
      // Should throw duplicate key error
      await expect(user2.save()).rejects.toThrow();
    });
    
    test('should update a user in the database', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      // Update user
      savedUser.name = 'Updated User Name';
      await savedUser.save();
      
      // Verify the update
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.name).toBe('Updated User Name');
    });
    
    test('should delete a user from the database', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      // Verify it exists
      let foundUser = await User.findById(savedUser._id);
      expect(foundUser).not.toBeNull();
      
      // Delete it
      await User.deleteOne({ _id: savedUser._id });
      
      // Verify it's gone
      foundUser = await User.findById(savedUser._id);
      expect(foundUser).toBeNull();
    });
  });
}); 