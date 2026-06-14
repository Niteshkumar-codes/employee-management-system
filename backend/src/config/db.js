import mongoose from 'mongoose';

// Mongoose Connection Event Handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connection established to MongoDB.');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection to MongoDB disconnected.');
});

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const fallbackUri = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/ems';
  const uris = [primaryUri, fallbackUri].filter(Boolean);
  let lastError = null;

  for (const uri of uris) {
    try {
      console.log(`Attempting MongoDB connection to: ${uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      });
      console.log(`MongoDB Connected: ${conn.connection.host} (using ${uri.startsWith('mongodb://127.0.0.1') ? 'local fallback' : 'configured MONGO_URI'})`);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Error connecting to MongoDB at ${uri}: ${error.message}`);
      if (uri === primaryUri && fallbackUri && fallbackUri !== primaryUri) {
        console.warn('Attempting to connect to local MongoDB fallback...');
      }
    }
  }

  console.error('All MongoDB connection attempts failed. Backend will not start.');
  if (lastError) {
    console.error(`Last error: ${lastError.message}`);
  }
  process.exit(1);
};

export default connectDB;
