const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Create an in-memory MongoDB server
let mongoServer;

/**
 * Connect to the in-memory database.
 */
const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to in-memory MongoDB server');
};

/**
 * Drop database, close the connection and stop mongod.
 */
const closeDatabase = async () => {
  if (mongoServer) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log('Closed in-memory MongoDB server');
  }
};

/**
 * Remove all the data for all db collections.
 */
const clearDatabase = async () => {
  if (mongoServer) {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Cleared all collections');
  }
};

module.exports = {
  connect,
  closeDatabase,
  clearDatabase
}; 