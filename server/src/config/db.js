import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("Local MongoDB not found, starting in-memory database...");
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("In-memory MongoDB connected");
    } catch (memError) {
      console.error("MongoDB connection error:", error);
      console.error("In-memory DB error:", memError);
    }
  }
};

export default connectDB;
