import mongoose from 'mongoose';
import dns from 'node:dns';

// Force DNS lookup to use Google Public DNS to resolve SRV querySrv ECONNREFUSED issues on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nestdrive';
  
  try {
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error details:', error);
    console.log('Connection URI attempted:', connUri.replace(/:([^@]+)@/, ':****@')); // Redact password for security
    console.log('Ensure you have MongoDB running locally or provide a valid MONGODB_URI in the .env file.');
    process.exit(1);
  }
};

export default connectDB;
