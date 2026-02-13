import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    deviceId: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    deviceResetRequested: {
        type: Boolean,
        default: false
    },
    // Student Details
    rollNo: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple documents to have no rollNo
        default: undefined // Important! Mongoose might default to null otherwise
    },
    department: {
        type: String // e.g. CSE, ECE
    },
    branch: {
        type: String,
        enum: ['CSE', 'ECE', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Chemical', 'Aerospace', 'Biotech'],
        default: function () {
            return this.department; // Use department as default branch
        }
    },
    year: {
        type: String // e.g. 1st Year, 2024
    },
    // Flexible profile matching your diagram (Department, Year, etc.)
    profile: {
        department: String,
        branch: String,
        year: String,
        section: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // For Teachers: list of assigned classes
    assignedClasses: [{
        branch: String,
        year: String,
        section: String
    }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
