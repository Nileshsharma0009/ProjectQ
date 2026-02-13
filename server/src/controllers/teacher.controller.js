import Lecture from '../models/Lecture.js';
import Classroom from '../models/Classroom.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Get teacher dashboard stats
// @route   GET /api/teacher/stats
// @access  Private/Teacher
export const getStats = async (req, res) => {
    try {
        const teacherId = req.user._id;

        // Total lectures
        const totalLectures = await Lecture.countDocuments({ teacherId });

        // Lectures this week
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const lecturesThisWeek = await Lecture.countDocuments({
            teacherId,
            createdAt: { $gte: startOfWeek }
        });

        // Get all classrooms teacher has taught
        const lectureClassrooms = await Lecture.distinct('classroomId', { teacherId });

        // Total students (from those classrooms)
        const totalStudents = await User.countDocuments({
            role: 'student',
            'profile.section': { $in: lectureClassrooms }
        });

        // Calculate average attendance
        const attendanceRecords = await Attendance.find({
            lectureId: { $in: await Lecture.find({ teacherId }).distinct('_id') }
        });

        const avgAttendance = attendanceRecords.length > 0
            ? (attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100
            : 0;

        res.json({
            totalLectures,
            lecturesThisWeek,
            totalStudents,
            averageAttendance: Math.round(avgAttendance)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics (monthly attendance, class-wise performance)
// @route   GET /api/teacher/analytics
// @access  Private/Teacher
export const getAnalytics = async (req, res) => {
    try {
        const teacherId = req.user._id;

        // Get last 6 months data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const lectures = await Lecture.find({
            teacherId,
            createdAt: { $gte: sixMonthsAgo }
        }).populate('classroomId');

        // Monthly attendance graph data
        const monthlyData = {};
        for (let i = 0; i < 6; i++) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            const monthKey = month.toLocaleString('default', { month: 'short' });
            monthlyData[monthKey] = { total: 0, present: 0 };
        }

        // Class-wise performance
        const classWiseData = {};

        for (const lecture of lectures) {
            const month = new Date(lecture.createdAt).toLocaleString('default', { month: 'short' });
            const className = lecture.classroomId?.name || 'Unknown';

            const attendances = await Attendance.find({ lectureId: lecture._id });
            const presentCount = attendances.filter(a => a.status === 'present').length;

            if (monthlyData[month]) {
                monthlyData[month].total += attendances.length;
                monthlyData[month].present += presentCount;
            }

            if (!classWiseData[className]) {
                classWiseData[className] = { total: 0, present: 0 };
            }
            classWiseData[className].total += attendances.length;
            classWiseData[className].present += presentCount;
        }

        // Calculate percentages
        const monthlyGraph = Object.keys(monthlyData).map(month => ({
            month,
            percentage: monthlyData[month].total > 0
                ? Math.round((monthlyData[month].present / monthlyData[month].total) * 100)
                : 0
        })).reverse();

        const classWisePerformance = Object.keys(classWiseData).map(className => ({
            class: className,
            percentage: classWiseData[className].total > 0
                ? Math.round((classWiseData[className].present / classWiseData[className].total) * 100)
                : 0,
            totalLectures: Math.round(classWiseData[className].total / 30) // Assuming ~30 students per class
        }));

        res.json({
            monthlyGraph,
            classWisePerformance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get today's lectures
// @route   GET /api/teacher/lectures/today
// @access  Private/Teacher
export const getTodaysLectures = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const lectures = await Lecture.find({
            teacherId: req.user._id,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate('classroomId', 'name');

        res.json(lectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get lecture details with attendance
// @route   GET /api/teacher/lectures/:id/details
// @access  Private/Teacher
export const getLectureDetails = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id).populate('classroomId');

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        // Verify teacher owns this lecture
        if (lecture.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this lecture' });
        }

        // Get attendance records
        const attendances = await Attendance.find({ lectureId: lecture._id })
            .populate('studentId', 'name email rollNo');

        const presentCount = attendances.filter(a => a.status === 'present').length;
        const absentCount = attendances.filter(a => a.status === 'absent').length;

        res.json({
            lecture,
            attendance: {
                total: attendances.length,
                present: presentCount,
                absent: absentCount,
                students: attendances
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    End/Close lecture
// @route   PUT /api/teacher/lectures/:id/end
// @access  Private/Teacher
export const endLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        if (lecture.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        lecture.isActive = false;
        lecture.endTime = new Date();
        await lecture.save();

        res.json({ message: 'Lecture ended successfully', lecture });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new lecture (Start Class)
// @route   POST /api/teacher/lectures
// @access  Private/Teacher
export const createLecture = async (req, res) => {
    try {
        const { classroomId, subject, scheduledTime } = req.body;

        // Validate scheduled time is within the next 24 hours (same day only)
        if (scheduledTime) {
            const scheduled = new Date(scheduledTime);
            const now = new Date();
            const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Check if scheduled time is in the past
            if (scheduled < now) {
                return res.status(400).json({
                    message: 'Scheduled time cannot be in the past. Please select a future time.'
                });
            }

            // Check if scheduled time is more than 24 hours away
            if (scheduled > twentyFourHoursLater) {
                return res.status(400).json({
                    message: 'Lectures can only be scheduled within the next 24 hours (same day). Please select a time within today.'
                });
            }
        }

        // Find or create a default classroom for this teacher
        let classroom = null;

        if (classroomId && classroomId !== 'default') {
            // Try to use provided classroom
            classroom = await Classroom.findById(classroomId);
        }

        // If no classroom found, create or use a virtual default one
        if (!classroom) {
            // Check if teacher already has a virtual classroom
            classroom = await Classroom.findOne({
                name: `Virtual Classroom - ${req.user.name}`,
                teacherId: req.user._id
            });

            // If not, create a new virtual classroom
            if (!classroom) {
                classroom = await Classroom.create({
                    name: `Virtual Classroom - ${req.user.name}`,
                    teacherId: req.user._id,
                    capacity: 100,
                    isVirtual: true // Mark as virtual classroom
                });
            }
        }

        const lecture = await Lecture.create({
            teacherId: req.user._id,
            classroomId: classroom._id,
            subject,
            allowedBranches: req.body.allowedBranches || ['All'], // Default to 'All' if not specified
            allowedYears: req.body.allowedYears || [], // Default to empty if not specified
            startTime: scheduledTime ? new Date(scheduledTime) : new Date(),
            isActive: true
        });

        // Populate classroom details before sending response
        await lecture.populate('classroomId');

        res.status(201).json(lecture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate/Refresh QR Code
// @route   POST /api/teacher/lectures/:id/qr
// @access  Private/Teacher
export const generateQr = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        // Ensure the teacher owns this lecture
        if (lecture.teacherId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this lecture" });
        }

        // Verify lecture is active
        if (!lecture.isActive) {
            return res.status(400).json({ message: "Lecture is not active" });
        }

        // Get QR expiry settings
        const settings = await (await import('../models/SecuritySettings.js')).default.findOne();
        const expirySeconds = settings?.qrExpiryEnabled ? (settings.qrExpirySeconds || 30) : 30;

        // Generate a random token
        const qrToken = crypto.randomBytes(32).toString('hex');

        // Set expiry based on settings
        const expiresAt = new Date(Date.now() + expirySeconds * 1000);

        lecture.currentQrToken = qrToken;
        lecture.qrExpiresAt = expiresAt;
        await lecture.save();

        res.json({ qrToken, expiresAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// @desc    Get teacher's lectures
// @route   GET /api/teacher/lectures
// @access  Private/Teacher
export const getLectures = async (req, res) => {
    try {
        const lectures = await Lecture.find({ teacherId: req.user._id })
            .populate('classroomId', 'name')
            .sort({ createdAt: -1 });
        res.json(lectures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classrooms for teacher selection
// @route   GET /api/teacher/classrooms
// @access  Private/Teacher
export const getClassrooms = async (req, res) => {
    try {
        const classrooms = await Classroom.find({});
        res.json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
