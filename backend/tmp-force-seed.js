import connectDB from './src/config/db.js';
import User from './src/models/user.model.js';

const run = async () => {
  try {
    await connectDB();
    const emails = ['admin@ems.com', 'hr@ems.com', 'employee@ems.com', 'persistence.admin@ems.local'];
    const users = await User.find({ email: { $in: emails } }).select('email name role createdAt').lean();
    console.log('Seeded user records:', users.length);
    console.dir(users, { depth: null });
    process.exit(0);
  } catch (err) {
    console.error('Seed check failed:', err);
    process.exit(1);
  }
};
run();
