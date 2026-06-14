import mongoose from 'mongoose';
import User from './src/models/user.model.js';
import Employee from './src/models/employee.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

const run = async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('connected');
    const users = await User.find({}).lean();
    const employees = await Employee.find({}).lean();
    console.log('users', users.map(u => ({email: u.email, role:u.role, id:u._id}))); 
    console.log('employees count', employees.length);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
