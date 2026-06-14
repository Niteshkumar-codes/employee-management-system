import mongoose from 'mongoose';
import User from './src/models/user.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';
const defaultUsers = [
  { email: 'admin@ems.com', name: 'Jane Doe (Admin)', password: 'password123', role: 'admin' },
  { email: 'hr@ems.com', name: 'John Smith (HR)', password: 'password123', role: 'hr' },
  { email: 'employee@ems.com', name: 'Alice Cooper', password: 'password123', role: 'employee' },
  { email: 'persistence.admin@ems.local', name: 'Persistence Admin', password: 'Password123!', role: 'admin' }
];

const run = async () => {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  for (const userData of defaultUsers) {
    const existing = await User.findOne({ email: userData.email });
    console.log('checking', userData.email, 'found?', !!existing);
    if (!existing) {
      try {
        const created = await User.create(userData);
        console.log('created', created.email);
      } catch (err) {
        console.error('create failed for', userData.email, err.message);
      }
    }
  }
  const users = await User.find({ email: { $in: defaultUsers.map(u => u.email) } }).select('email name role').lean();
  console.log('after seed, default users count', users.length);
  console.dir(users, { depth: null });
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
