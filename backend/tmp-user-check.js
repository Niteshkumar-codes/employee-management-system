import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

try {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const user = await User.findOne({ email: 'admin@ems.com' }).lean();
  console.log('admin@ems.com', user ? 'found' : 'not found');
  await mongoose.disconnect();
} catch (error) {
  console.error(error);
  process.exit(1);
}
