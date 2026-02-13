import Lecture from '../models/Lecture.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// 1. Overview Stats
export const getOverview = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const { branch, year, subject, dateFrom, dateTo } = req.query;

        // Build query
        const query = { teacherId };
        if (branch && branch !== 'all') query.allowedBranches = branch;
        if (year && year !== 'all') query.allowedYears = parseInt(year);
        if (subject && subject !== 'all') query.subject = subject;
        if (dateFrom || dateTo) {
            query.startTime = {};
            if (dateFrom) query.startTime.$gte = new Date(dateFrom);
            if (dateTo) query.startTime.$lte = new Date(dateTo);
        }

        // Get lectures
        const lectures = await Lecture.find(query);
        const lectureIds = lectures.map(l => l._id);

        // Stats
        const totalLectures = lectures.length;
        const completedLectures = lectures.filter(l => !l.isActive && l.endTime).length;

        // Get attendance records
        const attendanceRecords = await Attendance.find({
            lectureId: { $in: lectureIds }
        });

        // Calculate average attendance
        const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
        const totalRecords = attendanceRecords.length;
        const averageAttendance = totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 100)
            : 0;

        // Get unique students
        const uniqueStudentIds = [...new Set(attendanceRecords.map(a => a.studentId.toString()))];
        const totalStudents = uniqueStudentIds.length;

        res.json({
            totalLectures,
            completedLectures,
            totalStudents,
            averageAttendance
        });
    } catch (error) {
        console.error('Error fetching overview:', error);
        res.status(500).json({ message: 'Error fetching overview', error: error.message });
    }
};

// 2. Branch & Year Breakdown
export const getByBranchYear = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const { branch, year, subject, dateFrom, dateTo } = req.query;

        // Build query
        const query = { teacherId };
        if (branch && branch !== 'all') query.allowedBranches = branch;
        if (year && year !== 'all') query.allowedYears = parseInt(year);
        if (subject && subject !== 'all') query.subject = subject;
        if (dateFrom || dateTo) {
            query.startTime = {};
            if (dateFrom) query.startTime.$gte = new Date(dateFrom);
            if (dateTo) query.startTime.$lte = new Date(dateTo);
        }

        const lectures = await Lecture.find(query);

        // Group by branch & year
        const grouped = {};
        for (const lecture of lectures) {
            const branches = Array.isArray(lecture.allowedBranches) ? lecture.allowedBranches : [lecture.allowedBranches];
            const years = Array.isArray(lecture.allowedYears) ? lecture.allowedYears : [lecture.allowedYears];

            for (const b of branches) {
                for (const y of years) {
                    const key = `${b}-${y}`;
                    if (!grouped[key]) {
                        grouped[key] = {
                            branch: b,
                            year: y,
                            lectures: []
                        };
                    }
                    grouped[key].lectures.push(lecture._id);
                }
            }
        }

        // Calculate stats for each group
        const result = [];
        for (const key in grouped) {
            const group = grouped[key];
            const lectureIds = group.lectures;

            // Get attendance for these lectures
            const attendanceRecords = await Attendance.find({
                lectureId: { $in: lectureIds }
            });

            // Get students for this branch/year
            const students = await User.find({
                role: 'student',
                branch: group.branch,
                year: group.year,
                isApproved: true
            });

            const totalStudents = students.length;
            const lectureCount = lectureIds.length;
            const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
            const totalRecords = attendanceRecords.length;
            const averageAttendance = totalRecords > 0
                ? Math.round((presentCount / totalRecords) * 100)
                : 0;

            result.push({
                branch: group.branch,
                year: group.year,
                totalStudents,
                lectureCount,
                averageAttendance
            });
        }

        // Sort by branch then year
        result.sort((a, b) => {
            if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
            return a.year - b.year;
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching branch/year data:', error);
        res.status(500).json({ message: 'Error fetching branch/year data', error: error.message });
    }
};

// 3. Subject-wise Performance
export const getBySubject = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const { branch, year, subject, dateFrom, dateTo } = req.query;

        // Build query
        const query = { teacherId };
        if (branch && branch !== 'all') query.allowedBranches = branch;
        if (year && year !== 'all') query.allowedYears = parseInt(year);
        if (subject && subject !== 'all') query.subject = subject;
        if (dateFrom || dateTo) {
            query.startTime = {};
            if (dateFrom) query.startTime.$gte = new Date(dateFrom);
            if (dateTo) query.startTime.$lte = new Date(dateTo);
        }

        const lectures = await Lecture.find(query);

        // Group by subject
        const grouped = {};
        for (const lecture of lectures) {
            const subj = lecture.subject;
            if (!grouped[subj]) {
                grouped[subj] = {
                    name: subj,
                    lectures: []
                };
            }
            grouped[subj].lectures.push(lecture._id);
        }

        // Calculate stats for each subject
        const result = [];
        for (const subj in grouped) {
            const group = grouped[subj];
            const lectureIds = group.lectures;

            // Get attendance
            const attendanceRecords = await Attendance.find({
                lectureId: { $in: lectureIds }
            });

            const uniqueStudents = [...new Set(attendanceRecords.map(a => a.studentId.toString()))];
            const lectureCount = lectureIds.length;
            const studentCount = uniqueStudents.length;
            const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
            const totalRecords = attendanceRecords.length;
            const attendance = totalRecords > 0
                ? Math.round((presentCount / totalRecords) * 100)
                : 0;

            result.push({
                name: group.name,
                lectureCount,
                studentCount,
                attendance
            });
        }

        // Sort by subject name
        result.sort((a, b) => a.name.localeCompare(b.name));

        res.json(result);
    } catch (error) {
        console.error('Error fetching subject data:', error);
        res.status(500).json({ message: 'Error fetching subject data', error: error.message });
    }
};

// 4. Student Attendance Records
export const getStudentAttendance = async (req, res) => {
    try {
        const teacherId = req.user._id;
        const { branch, year, subject, dateFrom, dateTo } = req.query;

        // Build query
        const query = { teacherId };
        if (branch && branch !== 'all') query.allowedBranches = branch;
        if (year && year !== 'all') query.allowedYears = parseInt(year);
        if (subject && subject !== 'all') query.subject = subject;
        if (dateFrom || dateTo) {
            query.startTime = {};
            if (dateFrom) query.startTime.$gte = new Date(dateFrom);
            if (dateTo) query.startTime.$lte = new Date(dateTo);
        }

        const lectures = await Lecture.find(query);
        const lectureIds = lectures.map(l => l._id);

        // Get all attendance records
        const attendanceRecords = await Attendance.find({
            lectureId: { $in: lectureIds }
        }).populate('studentId', 'name rollNo branch year');

        // Group by student
        const studentMap = {};
        for (const record of attendanceRecords) {
            if (!record.studentId) continue; // Skip if student not found

            const studentId = record.studentId._id.toString();
            if (!studentMap[studentId]) {
                studentMap[studentId] = {
                    studentId: record.studentId._id,
                    rollNo: record.studentId.rollNo,
                    name: record.studentId.name,
                    branch: record.studentId.branch,
                    year: record.studentId.year,
                    present: 0,
                    absent: 0,
                    totalLectures: 0
                };
            }

            studentMap[studentId].totalLectures++;
            if (record.status === 'present') {
                studentMap[studentId].present++;
            } else if (record.status === 'absent') {
                studentMap[studentId].absent++;
            }
        }

        // Calculate percentages
        const result = Object.values(studentMap).map(student => ({
            ...student,
            percentage: student.totalLectures > 0
                ? Math.round((student.present / student.totalLectures) * 100)
                : 0
        }));

        // Sort by roll number
        result.sort((a, b) => a.rollNo.localeCompare(b.rollNo));

        res.json(result);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ message: 'Error fetching student attendance', error: error.message });
    }
};

// 5. Available Filters
export const getAvailableFilters = async (req, res) => {
    try {
        const teacherId = req.user._id;

        const lectures = await Lecture.find({ teacherId });

        // Extract unique values and combinations
        const branchesSet = new Set();
        const yearsSet = new Set();
        const subjectsSet = new Set();

        // Track valid class combinations (Branch + Year)
        const classesMap = new Map(); // "Branch-Year" -> { branch, year }

        lectures.forEach(lecture => {
            const lectureBranches = Array.isArray(lecture.allowedBranches)
                ? lecture.allowedBranches
                : [lecture.allowedBranches];

            const lectureYears = Array.isArray(lecture.allowedYears)
                ? lecture.allowedYears
                : [lecture.allowedYears];

            // Handle branches
            lectureBranches.forEach(b => {
                if (b) branchesSet.add(b);
            });

            // Handle years
            lectureYears.forEach(y => {
                if (y) yearsSet.add(y);
            });

            // Handle subjects
            if (lecture.subject) {
                subjectsSet.add(lecture.subject);
            }

            // Handle valid combinations (Classes)
            lectureBranches.forEach(b => {
                lectureYears.forEach(y => {
                    if (b && y) {
                        const key = `${b}-${y}`;
                        if (!classesMap.has(key)) {
                            classesMap.set(key, { branch: b, year: y });
                        }
                    }
                });
            });
        });

        const branches = Array.from(branchesSet).sort();
        const years = Array.from(yearsSet).sort((a, b) => a - b);
        const subjects = Array.from(subjectsSet).sort();

        // Convert map to array and sort
        const classes = Array.from(classesMap.values()).sort((a, b) => {
            if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
            return a.year - b.year;
        });

        res.json({
            branches,
            years,
            subjects,
            classes
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ message: 'Error fetching filters', error: error.message });
    }
};

// 6. Export Report (Placeholder - needs Excel/PDF libraries)
export const exportReport = async (req, res) => {
    try {
        const { format } = req.query;

        if (format === 'excel') {
            // TODO: Implement Excel export using 'exceljs'
            // For now, return JSON
            res.json({
                message: 'Excel export feature coming soon',
                note: 'Install exceljs: npm install exceljs'
            });
        } else if (format === 'pdf') {
            // TODO: Implement PDF export using 'pdfkit' or 'puppeteer'
            // For now, return JSON
            res.json({
                message: 'PDF export feature coming soon',
                note: 'Install pdfkit: npm install pdfkit'
            });
        } else {
            res.status(400).json({ message: 'Invalid export format. Use excel or pdf.' });
        }
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ message: 'Error exporting report', error: error.message });
    }
};
