import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    // Allowed branches for this lecture (e.g., ['CSE', 'ECE', 'Mechanical'])
    allowedBranches: [{
        type: String,
        enum: ['CSE', 'ECE', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Chemical', 'Aerospace', 'Biotech', 'All'],
        default: []
    }],
    // Allowed years (e.g., [1, 2, 3, 4])
    allowedYears: [{
        type: Number,
        min: 1,
        max: 5,
        default: []
    }],
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    // The current active QR token
    currentQrToken: {
        type: String,
        default: null
    },
    // When the QR code expires
    qrExpiresAt: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Lecture', lectureSchema);
