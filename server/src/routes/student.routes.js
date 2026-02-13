import express from 'express';
import {
    getStudentSummary,
    getActiveLectures,
    getAttendanceHistory,
    getAttendanceCalendar,
    getStudentProfile,
    getStudentSettings,
    changePassword,
    requestDeviceReset
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected and student-only
router.use(protect);
router.use(authorize('student'));

// Dashboard & Summary
router.get('/summary', getStudentSummary);
router.get('/active-lectures', getActiveLectures);
router.get('/history', getAttendanceHistory);
router.get('/calendar', getAttendanceCalendar);
router.get('/profile', getStudentProfile);
router.get('/settings', getStudentSettings);
router.put('/change-password', changePassword);
router.post('/request-device-reset', requestDeviceReset);

export default router;
