import express from 'express';
import {
    createLecture,
    generateQr,
    getLectures,
    getClassrooms,
    getStats,
    getAnalytics,
    getTodaysLectures,
    getLectureDetails,
    endLecture
} from '../controllers/teacher.controller.js';
import {
    getOverview,
    getByBranchYear,
    getBySubject,
    getStudentAttendance,
    getAvailableFilters,
    exportReport
} from '../controllers/teacher.reports.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected and restricted to Teacher
router.use(protect);
router.use(authorize('teacher'));

// Dashboard & Analytics
router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

// Reports & Analytics Dashboard
router.get('/reports/overview', getOverview);
router.get('/reports/by-branch-year', getByBranchYear);
router.get('/reports/by-subject', getBySubject);
router.get('/reports/student-attendance', getStudentAttendance);
router.get('/reports/available-filters', getAvailableFilters);
router.get('/reports/export', exportReport);

// Lectures
router.post('/lectures', createLecture);
router.get('/lectures', getLectures);
router.get('/lectures/today', getTodaysLectures);
router.get('/lectures/:id/details', getLectureDetails);
router.put('/lectures/:id/end', endLecture);
router.post('/lectures/:id/qr', generateQr);

// Classrooms
router.get('/classrooms', getClassrooms);

export default router;
