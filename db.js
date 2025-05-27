const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI; 
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri);

let dbInstance;

async function connectDB() {
  if (!dbInstance) {
    await client.connect();
    dbInstance = client.db(dbName); 
  }
  return dbInstance;
}

module.exports = connectDB;


