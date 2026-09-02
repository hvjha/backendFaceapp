import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        customEmployeeId: {
            type: String,
            required: true,
            trim: true
        },
        employeeName: {
            type: String,
            required: true
        },
        department: {
            type: String,
            default: 'General'
        },
        date: {
            type: String, // YYYY-MM-DD
            required: true,
            index: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            default: null
        },
        durationMinutes: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['In Progress', 'Completed', 'Partial'],
            default: 'In Progress'
        },
        checkInPhoto: {
            type: String,
            default: null
        },
        checkOutPhoto: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Compound index for quick employee attendance lookup
attendanceSchema.index({ employeeId: 1, date: -1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
