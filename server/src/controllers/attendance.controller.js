import Attendance from '../models/Attendance.js';
import Lecture from '../models/Lecture.js';
import Classroom from '../models/Classroom.js';
import User from '../models/User.js';
import SecuritySettings from '../models/SecuritySettings.js';

// Helper to calculate distance in meters (Haversine formula)
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// @desc    Mark Attendance (COMPLETE SECURITY VALIDATION)
// @route   POST /api/attendance/mark
// @access  Private/Student
export const markAttendance = async (req, res) => {
    try {
        const { lectureId, qrToken, latitude, longitude, deviceId } = req.body;
        const studentId = req.user._id;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // ========== STEP 1: GET SECURITY SETTINGS ==========
        let settings = await SecuritySettings.findOne();
        if (!settings) {
            // Create default settings if none exist
            settings = await SecuritySettings.create({
                geoFencingEnabled: true,
                deviceBindingEnabled: true,
                ipBindingEnabled: false,
                qrExpiryEnabled: true
            });
        }

        // ========== STEP 2: CHECK USER APPROVAL ==========
        if (!req.user.isApproved) {
            return res.status(403).json({
                success: false,
                message: "❌ Account not approved. Please contact admin."
            });
        }

        // ========== STEP 3: DEVICE BINDING (if enabled) ==========
        if (settings.deviceBindingEnabled) {
            if (!req.user.deviceId) {
                // First time - bind device
                req.user.deviceId = deviceId;
                req.user.userAgent = userAgent;
                await req.user.save();
            } else if (req.user.deviceId !== deviceId) {
                return res.status(403).json({
                    success: false,
                    message: "❌ Device mismatch. You can only mark attendance from your registered device. Contact admin to reset."
                });
            }
        }

        // ========== STEP 4: IP BINDING (if enabled) ==========
        if (settings.ipBindingEnabled) {
            if (!req.user.ipAddress) {
                // First time - bind IP
                req.user.ipAddress = ipAddress;
                await req.user.save();
            } else if (req.user.ipAddress !== ipAddress) {
                return res.status(403).json({
                    success: false,
                    message: `❌ IP address mismatch. Registered IP: ${req.user.ipAddress}, Current IP: ${ipAddress}. Contact admin to reset.`
                });
            }
        }

        // ========== STEP 5: FETCH & VALIDATE LECTURE ==========
        const lecture = await Lecture.findById(lectureId).populate('classroomId');
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "❌ Lecture not found."
            });
        }

        if (!lecture.isActive) {
            return res.status(400).json({
                success: false,
                message: "❌ Lecture has ended or is not active."
            });
        }

        // ========== STEP 6: VALIDATE QR TOKEN ==========
        if (lecture.currentQrToken !== qrToken) {
            return res.status(400).json({
                success: false,
                message: "❌ Invalid QR Code. Please scan the latest QR."
            });
        }

        // Check QR expiry (if enabled)
        if (settings.qrExpiryEnabled) {
            if (new Date() > new Date(lecture.qrExpiresAt)) {
                return res.status(400).json({
                    success: false,
                    message: "❌ QR Code expired. Ask teacher to generate new QR."
                });
            }
        }

        // ========== STEP 7: VALIDATE BRANCH/YEAR/SECTION ==========
        const studentBranch = req.user.branch || req.user.department || req.user.profile?.branch;
        const studentYear = req.user.year || req.user.profile?.year;
        const studentSection = req.user.profile?.section;

        // Check branch eligibility
        if (!studentBranch) {
            return res.status(400).json({
                success: false,
                message: "❌ Your branch information is missing. Please contact admin."
            });
        }

        if (lecture.allowedBranches && lecture.allowedBranches.length > 0) {
            const isAllowedBranch = lecture.allowedBranches.includes('All') ||
                lecture.allowedBranches.includes(studentBranch);

            if (!isAllowedBranch) {
                return res.status(403).json({
                    success: false,
                    message: `❌ This lecture is only for ${lecture.allowedBranches.join(', ')} students. Your branch (${studentBranch}) is not allowed.`,
                    allowedBranches: lecture.allowedBranches,
                    yourBranch: studentBranch
                });
            }
        }

        // ========== STEP 8: GEO-FENCING (if enabled) ==========
        const classroom = lecture.classroomId;

        if (settings.geoFencingEnabled && !classroom.isVirtual) {
            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: "❌ Location data missing. Please enable location services."
                });
            }

            const distance = getDistanceFromLatLonInM(
                latitude, longitude,
                classroom.latitude, classroom.longitude
            );

            const allowedRadius = classroom.radius || settings.geoFenceRadius;

            if (distance > allowedRadius) {
                return res.status(400).json({
                    success: false,
                    message: `❌ Too far from classroom. You are ${Math.round(distance)}m away (limit: ${allowedRadius}m)`,
                    distance: Math.round(distance),
                    allowedRadius
                });
            }
        }

        // ========== STEP 9: CHECK DUPLICATE ATTENDANCE ==========
        const existingAttendance = await Attendance.findOne({ studentId, lectureId });
        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: "✅ Attendance already marked for this lecture.",
                attendance: existingAttendance
            });
        }

        // ========== STEP 10: SAVE ATTENDANCE (SUCCESS!) ==========
        const attendance = await Attendance.create({
            studentId,
            lectureId,
            // Snapshot of student info
            studentName: req.user.name,
            rollNo: req.user.rollNo,
            branch: studentBranch,
            year: studentYear,
            section: studentSection,
            // Location
            location: { latitude, longitude },
            // Security data
            deviceId,
            ipAddress,
            userAgent,
            status: 'present'
        });

        res.status(201).json({
            success: true,
            message: "✅ Attendance marked successfully!",
            attendance: {
                id: attendance._id,
                subject: lecture.subject,
                markedAt: attendance.markedAt,
                status: attendance.status,
                studentName: req.user.name,
                rollNo: req.user.rollNo,
                branch: studentBranch
            }
        });

    } catch (error) {
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "✅ Attendance already marked for this lecture."
            });
        }

        console.error('❌ Attendance marking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get Student Attendance History
// @route   GET /api/attendance/history
// @access  Private/Student
export const getMyHistory = async (req, res) => {
    try {
        const history = await Attendance.find({ studentId: req.user._id })
            .populate({
                path: 'lectureId',
                select: 'subject startTime endTime',
                populate: { path: 'teacherId', select: 'name' }
            })
            .sort({ markedAt: -1 });

        res.json({
            success: true,
            history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
