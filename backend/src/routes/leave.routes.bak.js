import express from 'express';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import {
  applyLeave,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
} from '../controllers/leave.controller.js';

const router = express.Router();

// Apply for leave
// - Employees can apply for themselves; admin/hr can apply on behalf
router.post('/', protect, applyLeave);

// Get leave requests
// - Admin/HR see all; employee sees only their own
router.get('/', protect, (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (req.user.role === 'employee') {
      req.query.employee = req.user._id;
    }
    return getLeaveRequests(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Approve leave (admin, hr)
router.put('/:id/approve', protect, authorizeRoles('admin', 'hr'), approveLeave);

// Reject leave (admin, hr)
router.put('/:id/reject', protect, authorizeRoles('admin', 'hr'), rejectLeave);

export default router;
