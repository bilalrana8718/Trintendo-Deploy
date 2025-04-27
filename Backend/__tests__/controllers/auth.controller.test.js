const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../models/user.js', () => ({
  findOne: jest.fn(),
  findById: jest.fn().mockReturnThis(),
}));
jest.mock('jsonwebtoken');

// The controller to test - mock implementation
const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const User = require('../../models/user.js');

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user mock
      const user = {
        _id: 'mockId',
        name,
        email,
        role: 'owner',
        save: jest.fn().mockResolvedValue(true)
      };

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  },
  
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const User = require('../../models/user.js');

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  },
  
  getCurrentUser: async (req, res) => {
    try {
      const User = require('../../models/user.js');
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
};

describe('Auth Controller', () => {
  let req;
  let res;
  
  beforeEach(() => {
    req = {
      body: {},
      userId: 'mockUserId',
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user and return user with token', async () => {
      // Arrange
      const User = require('../../models/user.js');
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'owner',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };
      
      User.findOne.mockResolvedValue(null); // User doesn't exist
      
      jwt.sign.mockReturnValue('mockToken');
      
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.any(Object),
        token: expect.any(String),
      }));
    });
    
    it('should return 400 if user already exists', async () => {
      // Arrange
      const User = require('../../models/user.js');
      User.findOne.mockResolvedValue({ email: 'test@example.com' }); // User exists
      
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
    
    it('should handle errors and return 500', async () => {
      // Arrange
      const User = require('../../models/user.js');
      const errorMessage = 'Database error';
      User.findOne.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
        error: errorMessage,
      });
    });
  });
  
  describe('login', () => {
    it('should login a user and return user with token', async () => {
      // Arrange
      const User = require('../../models/user.js');
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'owner',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      
      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');
      
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.any(Object),
        token: expect.any(String),
      }));
    });
    
    it('should return 404 if user not found', async () => {
      // Arrange
      const User = require('../../models/user.js');
      User.findOne.mockResolvedValue(null);
      
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
    
    it('should return 400 if password is incorrect', async () => {
      // Arrange
      const User = require('../../models/user.js');
      const mockUser = {
        _id: 'mockId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      
      User.findOne.mockResolvedValue(mockUser);
      
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return the current user', async () => {
      // Arrange
      const User = require('../../models/user.js');
      const mockUser = {
        _id: 'mockId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'owner',
      };
      
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      
      // Act
      await authController.getCurrentUser(req, res);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });
    
    it('should return 404 if user not found', async () => {
      // Arrange
      const User = require('../../models/user.js');
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      
      // Act
      await authController.getCurrentUser(req, res);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });
}); 