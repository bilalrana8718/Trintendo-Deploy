const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth.middleware.js').default;

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should set userId and userRole and call next when token is valid', () => {
    // Arrange
    const mockToken = 'valid.token.here';
    const mockDecodedToken = { 
      id: 'user123',
      role: 'customer'
    };
    
    req.headers.authorization = `Bearer ${mockToken}`;
    jwt.verify.mockReturnValue(mockDecodedToken);
    
    process.env.JWT_SECRET = 'test_secret';
    
    // Act
    auth(req, res, next);
    
    // Assert
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
    expect(req.userId).toBe(mockDecodedToken.id);
    expect(req.userRole).toBe(mockDecodedToken.role);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  
  it('should return 401 when no authorization header is provided', () => {
    // Act
    auth(req, res, next);
    
    // Assert
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Authentication failed: No token provided' 
    });
  });
  
  it('should return 401 when token format is invalid', () => {
    // Arrange
    req.headers.authorization = 'InvalidFormat';
    
    // Act
    auth(req, res, next);
    
    // Assert
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Authentication failed: No token provided' 
    });
  });
  
  it('should return 401 when token verification fails', () => {
    // Arrange
    const mockToken = 'invalid.token.here';
    
    req.headers.authorization = `Bearer ${mockToken}`;
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    process.env.JWT_SECRET = 'test_secret';
    
    // Act
    auth(req, res, next);
    
    // Assert
    expect(jwt.verify).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Authentication failed: Invalid token' 
    });
  });
}); 