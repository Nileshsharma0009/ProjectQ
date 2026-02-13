import Attendance from '../models/Attendance.js';
import Lecture from '../models/Lecture.js';
import User from '../models/User.js';

// @desc    Get Student Dashboard Summary
// @route   GET /api/student/summary
// @access  Private/Student
export const getStudentSummary = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Get all attendance records for this student
        const attendances = await Attendance.find({ studentId });

        const totalLectures = attendances.length;
        const present = attendances.filter(a => a.status === 'present').length;
        const absent = totalLectures - present;
        const attendancePercentage = totalLectures > 0
            ? Math.round((present / totalLectures) * 100)
            : 0;

        // Get student details
        const student = await User.findById(studentId).select('-password');

        res.json({
            student: {
                name: student.name,
                rollNo: student.rollNo,
                branch: student.branch || student.department,
                year: student.year,
                section: student.profile?.section,
                deviceStatus: student.deviceId ? 'Verified' : 'Not Verified',
                ipStatus: student.ipAddress ? 'Bound' : 'Not Bound'
            },
            summary: {
                totalLectures,
                present,
                absent,
                attendancePercentage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Active Lectures for Student
// @route   GET /api/student/active-lectures
// @access  Private/Student
export const getActiveLectures = async (req, res) => {
    try {
        const studentBranch = req.user.branch || req.user.department;
        const studentYear = req.user.year;

        // Find active lectures that allow this student's branch
        const activeLectures = await Lecture.find({
            isActive: true,
            $or: [
                { allowedBranches: 'All' },
                { allowedBranches: studentBranch }
            ]
        })
            .populate('teacherId', 'name')
            .populate('classroomId', 'name')
            .sort({ startTime: -1 });

        res.json(activeLectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance History
// @route   GET /api/student/history
// @access  Private/Student
export const getAttendanceHistory = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { page = 1, limit = 20 } = req.query;

        const attendances = await Attendance.find({ studentId })
            .populate({
                path: 'lectureId',
                select: 'subject startTime endTime',
                populate: {
                    path: 'teacherId',
                    select: 'name'
                }
            })
            .sort({ markedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Attendance.countDocuments({ studentId });

        res.json({
            attendances,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Attendance Calendar
// @route   GET /api/student/calendar
// @access  Private/Student
export const getAttendanceCalendar = async (req, res) => {
    try {
        const studentId = req.user._id;
        const { month, year } = req.query;

        // Default to current month/year if not provided
        const currentDate = new Date();
        const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();

        // Get first and last day of the month
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Get all attendances for this month
        const attendances = await Attendance.find({
            studentId,
            markedAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('lectureId', 'subject startTime');

        // Format for calendar
        const calendarData = attendances.map(att => ({
            date: att.markedAt,
            status: att.status,
            subject: att.lectureId?.subject,
            lectureTime: att.lectureId?.startTime
        }));

        res.json({
            month: targetMonth,
            year: targetYear,
            attendances: calendarData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Profile
// @route   GET /api/student/profile
// @access  Private/Student
export const getStudentProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user._id).select('-password');
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get Student Security Settings (Read Only)
// @route   GET /api/student/settings
// @access  Private/Student
export const getStudentSettings = async (req, res) => {
    try {
        // Import dynamically to avoid circular dependency issues if any
        const SecuritySettings = await import('../models/SecuritySettings.js').then(m => m.default);

        const settings = await SecuritySettings.findOne();

        // Return only safe/public settings
        if (!settings) {
            return res.json({
                geoFencingEnabled: false,
                deviceBindingEnabled: false,
                ipBindingEnabled: false
            });
        }

        res.json({
            geoFencingEnabled: settings.geoFencingEnabled,
            geoFenceRadius: settings.geoFenceRadius,
            deviceBindingEnabled: settings.deviceBindingEnabled,
            ipBindingEnabled: settings.ipBindingEnabled
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change Student Password
// @route   PUT /api/student/change-password
// @access  Private/Student
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request Device Reset from Admin
// @route   POST /api/student/request-device-reset
// @access  Private/Student
export const requestDeviceReset = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        user.deviceResetRequested = true;
        await user.save();

        res.json({ message: 'Device reset requested successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
