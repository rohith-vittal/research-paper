import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set — running with in-memory store fallback.');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB connection failed, using in-memory fallback:', err.message);
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}
