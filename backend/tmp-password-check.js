import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const user = await User.findOne({ email: 'persistence.admin@ems.local' }).lean();
  console.log('user', user?.email, 'role', user?.role);
  if (user) {
    const match = await bcrypt.compare('password123', user.password);
    console.log('password123 matches:', match);
  }
  await mongoose.disconnect();
} catch (err) {
  console.error(err);
  process.exit(1);
}
