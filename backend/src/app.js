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

app.get('/api/debug/reset-test-user', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'test@gmail.com' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = 'password123';
    await user.save();

    return res.json({ success: true, message: 'Test user password reset' });
  } catch (error) {
    console.error('Reset test user endpoint error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to reset test user password' });
  }
});

app.get('/api/debug/create-employee-user', async (req, res) => {
  try {
    const email = 'employee@ems.com';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ created: false, email });
    }

    await User.create({
      name: 'Alice Cooper',
      email,
      password: 'password123',
      role: 'employee',
    });

    return res.json({ created: true, email });
  } catch (error) {
    console.error('Create employee user endpoint error:', error.message);
    return res.status(500).json({ created: false, email: 'employee@ems.com' });
  }
});

// Default Route
app.get('/', (req, res) => {
  res.send('EMS API Running...');
});

export default app;
