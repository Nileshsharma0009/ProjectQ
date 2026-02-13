import User from '../models/User.js';
import Classroom from '../models/Classroom.js';
import Lecture from '../models/Lecture.js';
import Attendance from '../models/Attendance.js';
import SecuritySettings from '../models/SecuritySettings.js';

// @desc    Get Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const activeLectures = await Lecture.countDocuments({ isActive: true });

        // Calculate Today's Attendance %
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysLectures = await Lecture.find({
            startTime: { $gte: startOfDay, $lte: endOfDay }
        });

        const todaysAttendance = await Attendance.countDocuments({
            markedAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Estimate total expected attendance (very rough estimate: students * lectures)
        // A better way would be sum of students in each lecture if we had that data readily available
        // For now, let's use totalStudents * todaysLectures.length as a base, or 0 if no lectures
        const expectedAttendance = totalStudents * todaysLectures.length;

        const attendancePercentage = expectedAttendance > 0
            ? Math.min(100, Math.round((todaysAttendance / expectedAttendance) * 100))
            : 0;

        res.json({
            totalStudents,
            totalTeachers,
            activeLectures,
            attendancePercentage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (with filters)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
    try {
        const { status, role, search } = req.query;
        let query = {};

        if (status === 'pending') {
            query.isApproved = false;
        } else if (status === 'approved') {
            query.isApproved = true; // explicitly approved
        } else if (status === 'device_reset') {
            query.deviceResetRequested = true;
        }

        if (role) {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { rollNo: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve/Reject/Disable User
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
    try {
        const { status, isActive } = req.body; // status: 'approved' | 'rejected', isActive: boolean
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (status === 'approved') {
            user.isApproved = true;
            user.isActive = true;
        } else if (status === 'rejected') {
            // rejection might just be deleting or keeping separate status. 
            // For now, let's just set approved=false
            user.isApproved = false;
        }

        if (typeof isActive === 'boolean') {
            user.isActive = isActive;
        }

        await user.save();
        res.json({ message: 'User status updated', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Device ID
// @route   PUT /api/admin/users/:id/reset-device
// @access  Private/Admin
export const resetDevice = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.deviceId = null;
        user.ipAddress = null;
        user.deviceResetRequested = false;
        await user.save();

        res.json({ message: 'Device binding reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign Classes to Teacher
// @route   PUT /api/admin/users/:id/assign-classes
// @access  Private/Admin
export const assignTeacherClasses = async (req, res) => {
    try {
        const { assignedClasses } = req.body; // Array of { branch, year }
        const user = await User.findById(req.params.id);

        if (!user || user.role !== 'teacher') {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        user.assignedClasses = assignedClasses;
        await user.save();

        res.json({ message: 'Classes assigned successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a classroom
// @route   POST /api/admin/classrooms
// @access  Private/Admin
export const createClassroom = async (req, res) => {
    try {
        const { name, latitude, longitude, radius } = req.body;

        const classroom = await Classroom.create({
            name,
            latitude,
            longitude,
            radius
        });

        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classrooms
// @route   GET /api/admin/classrooms
// @access  Private/Admin
export const getClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({});
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Security Settings
// @route   GET /api/admin/security-settings
// @access  Private/Admin
export const getSecuritySettings = async (req, res) => {
    try {
        // Use direct import since we are using ESM
        // Dynamic import was causing confusion in prev steps
        // But if it works, stick with it or standard import at top (I added standard import)

        // Wait, standard import for SecuritySettings might fail if file doesn't exist?
        // But previous steps showed it being used.
        // I'll assume it exists or use standard mongoose model pattern if available.
        // Actually, the previous code used dynamic import: (await import('../models/SecuritySettings.js')).default;
        // This implies it might be a module that exports default.
        // I imported it at top: import SecuritySettings from '../models/SecuritySettings.js';

        let settings = await SecuritySettings.findOne();

        if (!settings) {
            settings = await SecuritySettings.create({
                geoFencingEnabled: true,
                deviceBindingEnabled: true,
                ipBindingEnabled: false,
                qrExpiryEnabled: true,
                qrExpirySeconds: 30,
                geoFenceRadius: 50
            });
        }

        res.json(settings);
    } catch (error) {
        // Fallback if import failed (though top-level import should scream if fail)
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Security Settings
// @route   PUT /api/admin/security-settings
// @access  Private/Admin
export const updateSecuritySettings = async (req, res) => {
    try {
        const {
            geoFencingEnabled,
            deviceBindingEnabled,
            ipBindingEnabled,
            qrExpiryEnabled,
            qrExpirySeconds,
            geoFenceRadius
        } = req.body;

        let settings = await SecuritySettings.findOne();

        if (!settings) {
            settings = await SecuritySettings.create(req.body);
        } else {
            settings.geoFencingEnabled = geoFencingEnabled;
            settings.deviceBindingEnabled = deviceBindingEnabled;
            settings.ipBindingEnabled = ipBindingEnabled;
            settings.qrExpiryEnabled = qrExpiryEnabled;
            settings.qrExpirySeconds = qrExpirySeconds;
            settings.geoFenceRadius = geoFenceRadius;
            await settings.save();
        }

        res.json({ message: 'Security settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get System Logs (Mock for now or simple aggregation)
// @route   GET /api/admin/logs
export const getSystemLogs = async (req, res) => {
    try {
        // Return some dummy logs or aggregate data
        // For real implementation, we'd query a Log collection
        const logs = [
            { id: 1, type: 'Security', message: 'Geo-fencing enabled', timestamp: new Date() },
            { id: 2, type: 'Auth', message: 'New user registered', timestamp: new Date(Date.now() - 3600000) },
        ];
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Keeping approveUser for backward compatibility if routes use it, but generic updateUserStatus is better
export const approveUser = async (req, res) => {
    // Alias to updateUserStatus with status='approved'
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isApproved = true;
        user.isActive = true;
        await user.save();

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
