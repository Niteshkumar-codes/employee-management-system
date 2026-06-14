import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
	{
		employee: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Employee',
			required: [true, 'Employee reference is required'],
		},
		date: {
			type: Date,
			required: [true, 'Attendance date is required'],
		},
		checkIn: {
			type: Date,
		},
		checkOut: {
			type: Date,
			validate: {
				validator: function (v) {
					// only validate if both checkIn and checkOut are provided
					if (this.checkIn && v) {
						return v >= this.checkIn;
					}
					return true;
				},
				message: 'Check-out time must be equal to or after check-in time',
			},
		},
		status: {
			type: String,
			enum: {
				values: ['Present', 'Absent', 'Half-Day'],
				message: '{VALUE} is not a valid attendance status',
			},
			required: [true, 'Attendance status is required'],
		},
	},
	{
		timestamps: true,
	}
);

// Ensure one attendance record per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Optional helper: set default status based on presence of checkIn
attendanceSchema.pre('validate', function (next) {
	if (!this.status) {
		if (this.checkIn) this.status = 'Present';
		else this.status = 'Absent';
	}
	next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
