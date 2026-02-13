import express from 'express';
import { markAttendance, getMyHistory } from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Student marking attendance
router.post('/mark', authorize('student'), markAttendance);

// Student viewing history
router.get('/history', authorize('student'), getMyHistory);

export default router;
