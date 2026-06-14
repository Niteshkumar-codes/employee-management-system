import mongoose from 'mongoose';
import Employee from './src/models/employee.model.js';

const uri = 'mongodb://127.0.0.1:27017/ems';

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const emps = await Employee.find({}).select('name email employeeId').lean();
  console.log('employees count', emps.length);
  console.dir(emps, { depth: null });
  await mongoose.disconnect();
} catch (error) {
  console.error(error);
  process.exit(1);
}
