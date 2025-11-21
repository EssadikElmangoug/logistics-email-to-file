import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Default to localhost for local development, mongodb for Docker
    const defaultURI = process.env.NODE_ENV === 'production' 
      ? 'mongodb://mongodb:27017/logistics'
      : 'mongodb://localhost:27017/logistics';
    
    const mongoURI = process.env.MONGODB_URI || defaultURI;
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Make sure MongoDB is running and accessible');
    process.exit(1);
  }
};

export default connectDB;



