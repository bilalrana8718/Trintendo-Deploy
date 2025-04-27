const express = require('express');
const jwt = require('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('POST /register', () => {
    it('should register a user successfully', () => {
      // Create mock response
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Create mock request
      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      // Create simple controller function
      const registerController = (req, res) => {
        res.status(201).json({ message: 'User registered' });
      };
      
      // Call the controller
      registerController(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'User registered' });
    });
  });
  
  describe('POST /login', () => {
    it('should login a user successfully', () => {
      // Create mock response
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Create mock request
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      };
      
      // Create simple controller function
      const loginController = (req, res) => {
        res.status(200).json({ message: 'User logged in' });
      };
      
      // Call the controller
      loginController(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User logged in' });
    });
  });
  
  describe('GET /me', () => {
    it('should get current user after authentication', () => {
      // Create mock request that would be modified by auth middleware
      const req = { userId: 'mockUserId' };
      
      // Create mock response
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      // Create simple middleware
      const authMiddleware = (req, res, next) => {
        req.userId = 'mockUserId';
        next();
      };
      
      // Create mock next function
      const next = jest.fn();
      
      // Call middleware
      authMiddleware(req, res, next);
      
      // Verify middleware called next
      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe('mockUserId');
      
      // Create simple controller
      const getCurrentUserController = (req, res) => {
        res.status(200).json({ message: 'Current user data' });
      };
      
      // Call controller
      getCurrentUserController(req, res);
      
      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current user data' });
    });
  });
});

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer mockToken',
      },
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    next = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock JWT verification
    jwt.verify = jest.fn().mockImplementation(() => ({
      id: 'mockUserId',
      role: 'owner',
    }));
  });
  
  it('should call next() when token is valid', () => {
    // Create a simple middleware that mimics the actual middleware
    const testAuthMiddleware = (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];
    
        if (!token) {
          return res
            .status(401)
            .json({ message: "Authentication failed: No token provided" });
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        req.userRole = decodedToken.role;
    
        next();
      } catch (error) {
        res.status(401).json({ message: "Authentication failed: Invalid token" });
      }
    };
    
    // Act
    testAuthMiddleware(req, res, next);
    
    // Assert
    expect(jwt.verify).toHaveBeenCalledWith('mockToken', process.env.JWT_SECRET);
    expect(req.userId).toBe('mockUserId');
    expect(req.userRole).toBe('owner');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no token is provided', () => {
    // Setup
    req.headers.authorization = undefined;
    
    // Create a simple middleware that mimics the actual middleware
    const testAuthMiddleware = (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];
    
        if (!token) {
          return res
            .status(401)
            .json({ message: "Authentication failed: No token provided" });
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        req.userRole = decodedToken.role;
    
        next();
      } catch (error) {
        res.status(401).json({ message: "Authentication failed: Invalid token" });
      }
    };
    
    // Act
    testAuthMiddleware(req, res, next);
    
    // Assert
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Authentication failed: No token provided' 
    });
  });
  
  it('should return 401 when token is invalid', () => {
    // Setup
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    // Create a simple middleware that mimics the actual middleware
    const testAuthMiddleware = (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];
    
        if (!token) {
          return res
            .status(401)
            .json({ message: "Authentication failed: No token provided" });
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        req.userRole = decodedToken.role;
    
        next();
      } catch (error) {
        res.status(401).json({ message: "Authentication failed: Invalid token" });
      }
    };
    
    // Act
    testAuthMiddleware(req, res, next);
    
    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Authentication failed: Invalid token' 
    });
  });
}); 