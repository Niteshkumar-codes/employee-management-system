import Attendance from '../models/attendance.model.js';
import Employee from '../models/employee.model.js';

// Helper to normalize a date to start of day (local time)
const normalizeDate = (input) => {
  const d = input ? new Date(input) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Mark or update attendance for an employee on a given date
// @route   POST /api/attendance/mark
// @access  Private
export const markAttendance = async (req, res, next) => {
  try {
    let { employee, date, checkIn, checkOut, status } = req.body;

    console.log('markAttendance called. req.user:', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : null);
    console.log('markAttendance payload:', { employee, date, checkIn, checkOut, status });

    // If employee user, prefer attached req.employee
    if ((!employee || employee === '') && req.user && req.user.role === 'employee') {
      if (req.employee && req.employee._id) {
        employee = req.employee._id;
      } else {
        const emp = await Employee.findOne({ email: req.user.email }).select('_id email');
        console.log('markAttendance: resolved employee by email ->', emp ? { id: emp._id, email: emp.email } : null);
        if (emp) employee = emp._id;
      }
    }

    // employee id is required
    if (!employee) {
      return res.status(400).json({ message: 'Employee id is required' });
    }

    // ensure employee exists
    const exists = await Employee.findById(employee);
    console.log('markAttendance: employee lookup ->', exists ? { id: exists._id, email: exists.email } : null);
    if (!exists) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const attendanceDate = normalizeDate(date);

    const payload = {};
    if (checkIn) payload.checkIn = new Date(checkIn);
    if (checkOut) payload.checkOut = new Date(checkOut);
    if (status) payload.status = status;

    const attendanceQuery = {
      employee,
      date: {
        $gte: attendanceDate,
        $lte: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000 - 1)
      }
    };

    console.log('markAttendance: req.user ->', req.user ? { id: req.user._id, email: req.user.email, role: req.user.role } : null);
    console.log('markAttendance: employee used for query ->', employee);
    console.log('markAttendance: normalized attendanceDate ->', attendanceDate);
    console.log('markAttendance: attendanceQuery ->', attendanceQuery);

    const existingAttendance = await Attendance.findOne(attendanceQuery).populate('employee', 'name email employeeId');
    console.log('markAttendance: existingAttendance ->', existingAttendance ? {
      id: existingAttendance._id,
      date: existingAttendance.date,
      checkIn: existingAttendance.checkIn,
      checkOut: existingAttendance.checkOut,
      employee: existingAttendance.employee
    } : null);

    // Try update existing record for the employee+date, otherwise create
    let attendance = await Attendance.findOneAndUpdate(
      attendanceQuery,
      { $set: payload, $setOnInsert: { employee, date: attendanceDate } },
      { new: true, upsert: true, runValidators: true }
    ).populate('employee', 'name email employeeId');

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records (optionally filter by employee and date range)
// @route   GET /api/attendance
// @access  Private
export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { employee, startDate, endDate, page = 1, limit = 25 } = req.query;

    const filter = {};
    if (employee) filter.employee = employee;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = normalizeDate(startDate);
      if (endDate) {
        const d = normalizeDate(endDate);
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.max(parseInt(limit, 10) || 25, 1);

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate('employee', 'name email employeeId')
      .sort({ date: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim);

    res.status(200).json({ total, page: pageNum, limit: lim, records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for a single employee
// @route   GET /api/attendance/employee/:id
// @access  Private
export const getAttendanceByEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // ensure employee exists
    const exists = await Employee.findById(id);
    if (!exists) return res.status(404).json({ message: 'Employee not found' });

    const filter = { employee: id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = normalizeDate(startDate);
      if (endDate) {
        const d = normalizeDate(endDate);
        d.setHours(23, 59, 59, 999);
        filter.date.$lte = d;
      }
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export default {
  markAttendance,
  getAttendanceRecords,
  getAttendanceByEmployee,
};
