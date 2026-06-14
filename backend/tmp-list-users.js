import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const users = await User.find({}).lean();
  console.log('users count', users.length);
  console.dir(users, { depth: null });
  await mongoose.disconnect();
} catch (error) {
  console.error(error);
  process.exit(1);
}
