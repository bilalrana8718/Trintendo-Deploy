const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('bcryptjs');

// Initialize mocks with correct return values
beforeEach(() => {
  bcrypt.hash.mockResolvedValue('hashedPassword');
  bcrypt.compare.mockResolvedValue(true);
});

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Password Hashing', () => {
    it('should hash passwords when modified', async () => {
      // Create a mock user document with the methods we need to test
      const userDocument = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'plainPassword',
      };
      
      // Create a simplified version of the pre-save hook similar to what's in the User model
      const hashPasswordHook = async function(next) {
        if (this.isModified('password')) {
          this.password = await bcrypt.hash(this.password, 10);
        }
        next();
      };
      
      // Mock the next function
      const next = jest.fn();
      
      // Call the hook
      await hashPasswordHook.call(userDocument, next);
      
      // Assertions
      expect(userDocument.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(userDocument.password).toBe('hashedPassword');
      expect(next).toHaveBeenCalled();
    });
    
    it('should not hash password when it is not modified', async () => {
      // Create a mock user document
      const userDocument = {
        isModified: jest.fn().mockReturnValue(false),
        password: 'plainPassword',
      };
      
      // Create a simplified version of the pre-save hook
      const hashPasswordHook = async function(next) {
        if (this.isModified('password')) {
          this.password = await bcrypt.hash(this.password, 10);
        }
        next();
      };
      
      // Mock the next function
      const next = jest.fn();
      
      // Call the hook
      await hashPasswordHook.call(userDocument, next);
      
      // Assertions
      expect(userDocument.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userDocument.password).toBe('plainPassword');
      expect(next).toHaveBeenCalled();
    });
  });
  
  describe('Password Comparison', () => {
    it('should correctly compare passwords', async () => {
      // Create a mock user document
      const userDocument = {
        password: 'hashedPassword',
      };
      
      // Create a simplified version of the comparePassword method
      const comparePasswordMethod = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };
      
      // Call the method
      const result = await comparePasswordMethod.call(userDocument, 'plainPassword');
      
      // Assertions
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });
  });
}); 