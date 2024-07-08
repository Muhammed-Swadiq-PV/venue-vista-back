import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class MongoDB {
  private mongoURI: string;

  constructor() {
    this.mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mong';
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.mongoURI);
      console.log("Connected to MongoDB");
      this.checkConnection();
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }

  private checkConnection(): void {
    const connection = mongoose.connection;
    if (connection.readyState === 1) {
      console.log("MongoDB is connected!");
    } else {
      console.log("MongoDB connection is not established.");
    }
  }
}

export default MongoDB;
