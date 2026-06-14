import Employee from '../models/employee.model.js';
import Attendance from '../models/attendance.model.js';
import Leave from '../models/leave.model.js';

// Helper to get local start and end of a date
const getStartAndEndOfDay = (dateInput) => {
  const start = dateInput ? new Date(dateInput) : new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = dateInput ? new Date(dateInput) : new Date();
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// @desc    Get dashboard metrics and statistics
// @route   GET /api/dashboard/summary
// @access  Private
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userRole = req.user.role;

    // Check if user is an employee
    if (userRole === 'employee') {
      // Find the corresponding employee record
      const employee = await Employee.findOne({
        $or: [
          { _id: req.user._id },
          { email: req.user.email }
        ]
      });

      if (!employee) {
        return res.status(200).json({
          isEmployee: true,
          profileCompleted: false,
          message: 'Employee profile has not been created by Admin/HR yet.',
          profile: null,
          attendanceStats: { present: 0, absent: 0, halfDay: 0 },
          leaveStats: { pending: 0, approved: 0, rejected: 0, total: 0 },
          recentLeaves: [],
        });
      }

      // Fetch Attendance stats for this employee
      const attendanceRecords = await Attendance.find({ employee: employee._id });
      let presentCount = 0;
      let absentCount = 0;
      let halfDayCount = 0;

      attendanceRecords.forEach((record) => {
        if (record.status === 'Present') presentCount++;
        else if (record.status === 'Absent') absentCount++;
        else if (record.status === 'Half-Day') halfDayCount++;
      });

      // Fetch Leave stats for this employee
      const pendingLeaves = await Leave.countDocuments({ employee: employee._id, status: 'Pending' });
      const approvedLeaves = await Leave.countDocuments({ employee: employee._id, status: 'Approved' });
      const rejectedLeaves = await Leave.countDocuments({ employee: employee._id, status: 'Rejected' });
      const totalLeaves = pendingLeaves + approvedLeaves + rejectedLeaves;

      // Fetch 5 most recent leave requests for this employee
      const recentLeaves = await Leave.find({ employee: employee._id })
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        isEmployee: true,
        profileCompleted: true,
        profile: employee,
        attendanceStats: {
          present: presentCount,
          absent: absentCount,
          halfDay: halfDayCount,
        },
        leaveStats: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves,
          total: totalLeaves,
        },
        recentLeaves,
      });
    }

    // For Admin / HR
    const { start: todayStart, end: todayEnd } = getStartAndEndOfDay();

    // 1. Employee Count Stats
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });

    // 2. Today's Attendance Stats
    const attendanceToday = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    });

    let presentToday = 0;
    let absentToday = 0;
    let halfDayToday = 0;

    attendanceToday.forEach((record) => {
      if (record.status === 'Present') presentToday++;
      else if (record.status === 'Absent') absentToday++;
      else if (record.status === 'Half-Day') halfDayToday++;
    });

    // Unmarked attendance are active employees who haven't marked attendance today
    const unmarkedToday = Math.max(activeEmployees - attendanceToday.length, 0);

    // 3. Leave Request Stats (Overall)
    const pendingLeavesCount = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeavesCount = await Leave.countDocuments({ status: 'Approved' });
    const rejectedLeavesCount = await Leave.countDocuments({ status: 'Rejected' });

    // 4. Department-wise breakdown
    const departmentStats = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // 5. Recent Leave Requests (5 overall)
    const recentLeaves = await Leave.find({})
      .populate('employee', 'name email employeeId department designation')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      isEmployee: false,
      employeeStats: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees,
      },
      todayAttendance: {
        present: presentToday,
        absent: absentToday,
        halfDay: halfDayToday,
        unmarked: unmarkedToday,
      },
      leaveStats: {
        pending: pendingLeavesCount,
        approved: approvedLeavesCount,
        rejected: rejectedLeavesCount,
      },
      departmentStats,
      recentLeaves,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardSummary,
};
