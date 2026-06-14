import Leave from '../models/leave.model.js';
import Employee from '../models/employee.model.js';

// Helper to normalize date (start of day)
const normalizeDate = (input) => {
  const d = input ? new Date(input) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
export const applyLeave = async (req, res, next) => {
  try {
    let { employee, leaveType, startDate, endDate, reason } = req.body;

    console.log('applyLeave called. req.user:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : null);
    console.log('applyLeave payload:', { employee, leaveType, startDate, endDate, reason });

    // If requester is an employee, force employee to themselves
    if (req.user && req.user.role === 'employee') {
      // Prefer attached req.employee (from auth middleware) when available
      if (req.employee && req.employee._id) {
        employee = req.employee._id;
      } else {
        // Fallback: try to resolve by user's email
        const emp = await Employee.findOne({ email: req.user.email }).select('_id email');
        console.log('applyLeave: resolved employee by email ->', emp ? { id: emp._id, email: emp.email } : null);
        if (emp) employee = emp._id;
      }
    }

    if (!employee) return res.status(400).json({ message: 'Employee id is required' });
    if (!leaveType) return res.status(400).json({ message: 'Leave type is required' });
    if (!startDate || !endDate) return res.status(400).json({ message: 'Start date and end date are required' });
    if (!reason) return res.status(400).json({ message: 'Reason is required' });

    // validate employee exists
    const exists = await Employee.findById(employee);
    console.log('applyLeave: employee lookup result ->', exists ? { id: exists._id, email: exists.email } : null);
    if (!exists) return res.status(404).json({ message: 'Employee not found' });

    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);

    if (e < s) return res.status(400).json({ message: 'End date must be the same or after start date' });

    // Accept friendly leaveType values (map common labels to model enums)
    const typeMap = { 'Sick Leave': 'Sick', 'Casual Leave': 'Casual', 'Annual Leave': 'Earned' };
    const normalizedType = typeMap[leaveType] || leaveType;

    const leave = await Leave.create({
      employee,
      leaveType: normalizedType,
      startDate: s,
      endDate: e,
      reason,
    });

    console.log('applyLeave: created leave ->', { id: leave._id, employee: leave.employee, leaveType: leave.leaveType });
    return res.status(201).json(leave);
  } catch (error) {
    console.error('applyLeave error:', error.message);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// @desc    Get leave requests (filterable)
// @route   GET /api/leaves
// @access  Private
export const getLeaveRequests = async (req, res, next) => {
  try {
    const { employee, status, startDate, endDate, page = 1, limit = 25 } = req.query;

    const filter = {};
    if (employee) filter.employee = employee;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.$and = [];
      if (startDate) filter.$and.push({ endDate: { $gte: normalizeDate(startDate) } });
      if (endDate) {
        const d = normalizeDate(endDate);
        d.setHours(23, 59, 59, 999);
        filter.$and.push({ startDate: { $lte: d } });
      }
      if (filter.$and.length === 0) delete filter.$and;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 25, 1);

    const total = await Leave.countDocuments(filter);
    const records = await Leave.find(filter)
      .populate('employee', 'name email employeeId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.status(200).json({ total, page: pageNum, limit: lim, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a leave request
// @route   POST /api/leaves/:id/approve
// @access  Private
export const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (leave.status === 'Approved') return res.status(400).json({ message: 'Leave already approved' });
    if (leave.status === 'Rejected') return res.status(400).json({ message: 'Cannot approve a rejected leave' });

    // Check overlapping approved leaves for the same employee
    const overlap = await Leave.findOne({
      _id: { $ne: leave._id },
      employee: leave.employee,
      status: 'Approved',
      startDate: { $lte: leave.endDate },
      endDate: { $gte: leave.startDate },
    });
    if (overlap) return res.status(400).json({ message: 'Overlapping approved leave exists for this employee' });

    leave.status = 'Approved';
    await leave.save();

    res.status(200).json(leave);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a leave request
// @route   POST /api/leaves/:id/reject
// @access  Private
export const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    if (leave.status === 'Rejected') return res.status(400).json({ message: 'Leave already rejected' });
    if (leave.status === 'Approved') return res.status(400).json({ message: 'Cannot reject an approved leave' });

    leave.status = 'Rejected';
    await leave.save();

    res.status(200).json(leave);
  } catch (error) {
    next(error);
  }
};

export default {
  applyLeave,
  getLeaveRequests,
  approveLeave,
  rejectLeave,
};
