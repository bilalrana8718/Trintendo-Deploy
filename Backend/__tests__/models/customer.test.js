import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dbHandler from '../../test-utils/db.js';
import Customer from '../../models/customer.js';

describe('Customer Model', () => {
  let validCustomerData;
  
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
    validCustomerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      }
    };
  });
  
  describe('Schema Validation', () => {
    test('should validate a valid customer', async () => {
      const customer = new Customer(validCustomerData);
      await expect(customer.validate()).resolves.toBeUndefined();
    });
    
    test('should require name field', async () => {
      const customer = new Customer({ ...validCustomerData, name: undefined });
      
      await expect(customer.validate()).rejects.toThrow();
      try {
        await customer.validate();
      } catch (error) {
        expect(error.errors.name).toBeDefined();
      }
    });
    
    test('should require email field', async () => {
      const customer = new Customer({ ...validCustomerData, email: undefined });
      
      await expect(customer.validate()).rejects.toThrow();
      try {
        await customer.validate();
      } catch (error) {
        expect(error.errors.email).toBeDefined();
      }
    });
    
    test('should require password field', async () => {
      const customer = new Customer({ ...validCustomerData, password: undefined });
      
      await expect(customer.validate()).rejects.toThrow();
      try {
        await customer.validate();
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });
    
    test('should not require phone field', async () => {
      const customer = new Customer({ ...validCustomerData, phone: undefined });
      await expect(customer.validate()).resolves.toBeUndefined();
    });
    
    test('should not require address field', async () => {
      const customer = new Customer({ ...validCustomerData, address: undefined });
      await expect(customer.validate()).resolves.toBeUndefined();
    });
    
    test('should set default values correctly', () => {
      const customer = new Customer(validCustomerData);
      expect(customer.createdAt).toBeInstanceOf(Date);
    });
    
    test('should reject password with less than minimum length', async () => {
      const customer = new Customer({ ...validCustomerData, password: '12345' }); // less than 6 chars
      
      await expect(customer.validate()).rejects.toThrow();
      try {
        await customer.validate();
      } catch (error) {
        expect(error.errors.password).toBeDefined();
      }
    });
  });
  
  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      // Spy on bcrypt hash function
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      
      const customer = new Customer(validCustomerData);
      await customer.save();
      
      // Verify that hash was called
      expect(hashSpy).toHaveBeenCalledWith(validCustomerData.password, 10);
      
      // Verify password was hashed (not plain text)
      expect(customer.password).not.toBe(validCustomerData.password);
      
      // Restore the original implementation
      hashSpy.mockRestore();
    });
    
    test('should not rehash password if not modified', async () => {
      // First save to hash the password
      const customer = new Customer(validCustomerData);
      await customer.save();
      
      // Get the hashed password
      const originalHashedPassword = customer.password;
      
      // Spy on bcrypt hash function after first save
      const hashSpy = jest.spyOn(bcrypt, 'hash');
      
      // Update something other than password
      customer.name = 'Updated Name';
      await customer.save();
      
      // Verify hash was not called again
      expect(hashSpy).not.toHaveBeenCalled();
      expect(customer.password).toBe(originalHashedPassword);
      
      // Restore the original implementation
      hashSpy.mockRestore();
    });
  });
  
  describe('Methods', () => {
    test('comparePassword should return true for correct password', async () => {
      // Spy on bcrypt compare function
      const compareSpy = jest.spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      
      const customer = new Customer(validCustomerData);
      await customer.save();
      
      const result = await customer.comparePassword(validCustomerData.password);
      
      expect(compareSpy).toHaveBeenCalled();
      expect(result).toBe(true);
      
      // Restore the original implementation
      compareSpy.mockRestore();
    });
    
    test('comparePassword should return false for incorrect password', async () => {
      // Spy on bcrypt compare function
      const compareSpy = jest.spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      
      const customer = new Customer(validCustomerData);
      await customer.save();
      
      const result = await customer.comparePassword('wrongpassword');
      
      expect(compareSpy).toHaveBeenCalled();
      expect(result).toBe(false);
      
      // Restore the original implementation
      compareSpy.mockRestore();
    });
  });
  
  describe('Database Operations', () => {
    test('should save a customer to the database', async () => {
      const customer = new Customer(validCustomerData);
      const savedCustomer = await customer.save();
      
      expect(savedCustomer._id).toBeDefined();
      
      // Verify we can find it
      const foundCustomer = await Customer.findById(savedCustomer._id);
      expect(foundCustomer).not.toBeNull();
      expect(foundCustomer.email).toBe(validCustomerData.email);
    });
    
    test('should update a customer in the database', async () => {
      const customer = new Customer(validCustomerData);
      const savedCustomer = await customer.save();
      
      // Update customer
      savedCustomer.name = 'Updated Name';
      savedCustomer.phone = '9876543210';
      await savedCustomer.save();
      
      // Verify the update
      const updatedCustomer = await Customer.findById(savedCustomer._id);
      expect(updatedCustomer.name).toBe('Updated Name');
      expect(updatedCustomer.phone).toBe('9876543210');
    });
    
    test('should delete a customer from the database', async () => {
      const customer = new Customer(validCustomerData);
      const savedCustomer = await customer.save();
      
      // Verify it exists
      let foundCustomer = await Customer.findById(savedCustomer._id);
      expect(foundCustomer).not.toBeNull();
      
      // Delete it
      await Customer.deleteOne({ _id: savedCustomer._id });
      
      // Verify it's gone
      foundCustomer = await Customer.findById(savedCustomer._id);
      expect(foundCustomer).toBeNull();
    });
    
    test('should enforce email uniqueness', async () => {
      // Create first customer
      const customer1 = new Customer(validCustomerData);
      await customer1.save();
      
      // Try to create another customer with the same email
      const customer2 = new Customer(validCustomerData);
      
      // This should fail with a duplicate key error
      await expect(customer2.save()).rejects.toThrow();
    });
  });
}); 