import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error('MONGO_URI it not set');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log('MONGODB Connected: ', conn.connection.host);
  } catch (error) {
    console.error('Error connecting to MONGODB: ', error);
    process.exit(1); // 1 status code means failed, 0 means success
  }
};
