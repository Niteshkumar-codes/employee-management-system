import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const user = await User.findOne({ email: 'persistence.admin@ems.local' }).lean();
  console.log('user', user.email);
  const candidates = ['password123', 'Password123!', 'Password123', 'password123!', 'password', 'welcome123'];
  for (const candidate of candidates) {
    const match = await bcrypt.compare(candidate, user.password);
    console.log(candidate, match);
  }
  await mongoose.disconnect();
} catch (err) {
  console.error(err);
  process.exit(1);
}
