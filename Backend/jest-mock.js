// This file contains common Jest mocks for the project

// Mock mongoose to avoid actual DB operations
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  
  // Create a Schema constructor that returns an object with a pre method
  const SchemaMock = function() {
    return {
      pre: jest.fn(),
    };
  };
  
  // Add the Types property to Schema
  SchemaMock.Types = {
    ObjectId: String
  };
  
  return {
    ...originalModule,
    Schema: SchemaMock,
    model: jest.fn().mockImplementation((modelName) => {
      // Return different model constructors based on the model name
      return function ModelConstructor() {
        return {
          validateSync: jest.fn().mockReturnValue(undefined),
          save: jest.fn().mockResolvedValue({}),
          isModified: jest.fn().mockReturnValue(false)
        };
      };
    }),
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      on: jest.fn(),
      once: jest.fn()
    }
  };
}); 