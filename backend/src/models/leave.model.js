import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    leaveType: {
      type: String,
      enum: {
        values: ['Sick', 'Casual', 'Earned'],
        message: '{VALUE} is not a valid leave type',
      },
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (v) {
          if (this.startDate && v) {
            return v >= this.startDate;
          }
          return true;
        },
        message: 'End date must be the same or after start date',
      },
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [5, 'Reason must be at least 5 characters long'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Rejected'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'Pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: ensure an employee doesn't have overlapping approved leaves
leaveSchema.index({ employee: 1, startDate: 1, endDate: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
