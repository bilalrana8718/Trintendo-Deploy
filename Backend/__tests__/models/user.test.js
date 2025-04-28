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
      email: 'testuser@example.com',
      password: 'password123',
      role: 'owner'
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
        role: 'invalid_role'
      });
      
      await expect(user.validate()).rejects.toThrow();
      try {
        await user.validate();
      } catch (error) {
        expect(error.errors.role).toBeDefined();
      }
    });
    
    test('should allow all valid role enum values', async () => {
      // Test 'owner' role
      const ownerUser = new User({ ...validUserData, role: 'owner' });
      await expect(ownerUser.validate()).resolves.toBeUndefined();
      
      // Test 'admin' role
      const adminUser = new User({ ...validUserData, role: 'admin' });
      await expect(adminUser.validate()).resolves.toBeUndefined();
      
      // Test 'rider' role
      const riderUser = new User({ ...validUserData, role: 'rider' });
      await expect(riderUser.validate()).resolves.toBeUndefined();
    });
    
    test('should set default values correctly', () => {
      const user = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });
      
      expect(user.role).toBe('owner');
      expect(user.createdAt).toBeInstanceOf(Date);
    });
    
    test('should reject password with less than minimum length', async () => {
      const user = new User({ ...validUserData, password: '12345' }); // less than 6 chars
      
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
      // Spy on bcrypt hash function
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      
      const user = new User(validUserData);
      await user.save();
      
      // Verify that hash was called
      expect(hashSpy).toHaveBeenCalledWith(validUserData.password, 10);
      
      // Verify password was hashed (not plain text)
      expect(user.password).not.toBe(validUserData.password);
      
      // Restore the original implementation
      hashSpy.mockRestore();
    });
    
    test('should not rehash password if not modified', async () => {
      // First save to hash the password
      const user = new User(validUserData);
      await user.save();
      
      // Get the hashed password
      const originalHashedPassword = user.password;
      
      // Spy on bcrypt hash function after first save
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      
      // Update something other than password
      user.name = 'Updated Name';
      await user.save();
      
      // Verify hash was not called again
      expect(hashSpy).not.toHaveBeenCalled();
      expect(user.password).toBe(originalHashedPassword);
      
      // Restore the original implementation
      hashSpy.mockRestore();
    });
  });
  
  describe('Methods', () => {
    test('comparePassword should return true for correct password', async () => {
      // Spy on bcrypt compare function
      const compareSpy = jest.spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      
      const user = new User(validUserData);
      await user.save();
      
      const result = await user.comparePassword(validUserData.password);
      
      expect(compareSpy).toHaveBeenCalled();
      expect(result).toBe(true);
      
      // Restore the original implementation
      compareSpy.mockRestore();
    });
    
    test('comparePassword should return false for incorrect password', async () => {
      // Spy on bcrypt compare function
      const compareSpy = jest.spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      
      const user = new User(validUserData);
      await user.save();
      
      const result = await user.comparePassword('wrongpassword');
      
      expect(compareSpy).toHaveBeenCalled();
      expect(result).toBe(false);
      
      // Restore the original implementation
      compareSpy.mockRestore();
    });
  });
  
  describe('Database Operations', () => {
    test('should save a user to the database', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      
      // Verify we can find it
      const foundUser = await User.findById(savedUser._id);
      expect(foundUser).not.toBeNull();
      expect(foundUser.email).toBe(validUserData.email);
    });
    
    test('should update a user in the database', async () => {
      const user = new User(validUserData);
      const savedUser = await user.save();
      
      // Update user
      savedUser.name = 'Updated Name';
      savedUser.role = 'admin';
      await savedUser.save();
      
      // Verify the update
      const updatedUser = await User.findById(savedUser._id);
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.role).toBe('admin');
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
    
    test('should enforce email uniqueness', async () => {
      // Create first user
      const user1 = new User(validUserData);
      await user1.save();
      
      // Try to create another user with the same email
      const user2 = new User(validUserData);
      
      // This should fail with a duplicate key error
      await expect(user2.save()).rejects.toThrow();
    });
  });
}); 