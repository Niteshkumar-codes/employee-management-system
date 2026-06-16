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

// Default Route
app.get('/', (req, res) => {
  res.send('EMS API Running...');
});

export default app;
