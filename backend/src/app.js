import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import User from './models/user.model.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/debug/users', async (req, res) => {
  try {
    let adminUser = await User.findOne({ email: 'admin@ems.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@ems.com',
        password: 'password123',
        role: 'admin',
      });
      console.log('Debug endpoint created missing admin user: admin@ems.com');
    }

    const users = await User.find({}, 'email').lean();
    const emails = users.map((user) => user.email).filter(Boolean);
    return res.json({
      totalUsers: users.length,
      emails,
      adminExists: emails.includes('admin@ems.com'),
    });
  } catch (error) {
    console.error('Debug users endpoint error:', error.message);
    return res.status(500).json({ message: 'Unable to fetch user debug data' });
  }
});

app.post('/api/debug/create-admin', async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@ems.com' });
    if (existingAdmin) {
      return res.json({ created: false, message: 'Admin user already exists' });
    }

    await User.create({
      name: 'Admin User',
      email: 'admin@ems.com',
      password: 'password123',
      role: 'admin',
    });

    return res.json({ created: true, message: 'Admin user created' });
  } catch (error) {
    console.error('Create admin debug endpoint error:', error.message);
    return res.status(500).json({ message: 'Unable to create admin user' });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('EMS API Running...');
});

export default app;
