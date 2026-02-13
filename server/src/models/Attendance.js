import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lectureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture',
        required: true
    },
    // Snapshot of student details at time of attendance
    studentName: String,
    rollNo: String,
    branch: String,
    year: String,
    section: String,

    // Location data
    location: {
        latitude: Number,
        longitude: Number
    },

    // Security data
    deviceId: String,
    ipAddress: String,
    userAgent: String,

    status: {
        type: String,
        enum: ['present', 'absent'],
        default: 'present'
    },
    markedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent duplicate attendance for the same lecture
attendanceSchema.index({ studentId: 1, lectureId: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
