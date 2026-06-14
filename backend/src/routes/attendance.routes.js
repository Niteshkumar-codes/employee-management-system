import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  markAttendance,
  getAttendanceRecords,
  getAttendanceByEmployee,
} from '../controllers/attendance.controller.js';

const router = express.Router();

// Mark or update attendance
// - Employees can mark their own attendance
// - Admin/HR can mark for any employee
router.post('/', protect, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    if (req.user.role === 'employee') {
      // prefer the resolved Employee record (req.employee) when available
      if (req.employee && req.employee._id) {
        req.body.employee = req.employee._id;
      } else {
        // fallback to user id if employee record missing
        req.body.employee = req.user._id;
      }
    } else {
      // admin/hr must provide employee id when marking
      if (!req.body.employee) return res.status(400).json({ message: 'Employee id is required' });
    }

    return markAttendance(req, res, next);
  } catch (error) {
    next(error);
  }
});

// View all attendance records — only admin and hr
router.get('/', protect, authorizeRoles('admin', 'hr'), getAttendanceRecords);

// View attendance for a specific employee
// - Admin/HR can view any employee
// - Employee can view only their own records
router.get('/employee/:employeeId', protect, async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });

    if (req.user.role === 'employee') {
      const ownEmpId = req.employee && req.employee._id ? req.employee._id.toString() : null;
      if (ownEmpId && ownEmpId !== employeeId) {
        return res.status(403).json({ message: 'Forbidden: cannot view other employee attendance' });
      }
    }

    // Controller expects req.params.id
    req.params.id = employeeId;
    return getAttendanceByEmployee(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router;
