import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skypetrol';

  try {
    console.log(`[DATABASE] Connecting to database...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    isMongoConnected = true;
    console.log(`[DATABASE] Successfully connected to MongoDB Atlas / Database.`);
  } catch (error: any) {
    isMongoConnected = false;
    console.warn(`[DATABASE] MongoDB connection unavailable (${error?.message || 'Timeout'}). Operating in Instant In-Memory Store Mode.`);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (isMongoConnected) {
    await mongoose.disconnect();
  }
};
