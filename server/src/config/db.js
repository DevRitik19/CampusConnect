import mongoose from 'mongoose';
import { ENV } from './env.js';

export const connectDB = async () => {
  try {
    if (!ENV.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment variables');
    }

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
    });

    console.log(`[Database] MongoDB Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (ENV.NODE_ENV === 'production') {
      process.exit(1);
    }
    throw error;
  }
};
