import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Employee from '../models/employee.model.js';

// Protect routes - Verify JWT token
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Try to map a corresponding Employee document (by email) so controllers
      // can resolve an employee record for employee-role users.
      try {
        let emp = await Employee.findOne({ email: req.user.email }).select('_id employeeId name email');

        // If user is an employee and no Employee record exists, create a minimal one
        if (!emp && req.user.role === 'employee') {
          const generatedId = 'EMP' + Math.floor(1000 + Math.random() * 9000);
          console.log('auth.protect: creating minimal Employee record for user', req.user.email);
          emp = await Employee.create({
            employeeId: generatedId,
            name: req.user.name || req.user.email.split('@')[0],
            email: req.user.email,
            phone: '0000000000',
            department: 'General',
            designation: 'Employee',
            salary: 0,
            joiningDate: new Date()
          });
        }

        req.employee = emp || null;
        if (process.env.NODE_ENV !== 'production') {
          console.log('auth.protect: attached req.user ->', { id: req.user._id, email: req.user.email, role: req.user.role });
          console.log('auth.protect: resolved req.employee ->', emp ? { id: emp._id, email: emp.email } : null);
        }
      } catch (e) {
        console.error('auth.protect: employee lookup/creation failed', e.message);
        req.employee = null;
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Authorize specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user session' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource`,
      });
    }

    next();
  };
};
