import express from 'express';
import {
    getUsers,
    approveUser,
    updateUserStatus,
    resetDevice,
    assignTeacherClasses,
    createClassroom,
    getClassrooms,
    getSecuritySettings,
    updateSecuritySettings,
    getDashboardStats,
    getSystemLogs
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard Stats
router.get('/stats', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser); // Legacy/Alias
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/reset-device', resetDevice);
router.put('/users/:id/assign-classes', assignTeacherClasses);

// Classroom Management
router.post('/classrooms', createClassroom);
router.get('/classrooms', getClassrooms);

// Security Settings
router.get('/security-settings', getSecuritySettings);
router.put('/security-settings', updateSecuritySettings);

// Logs
router.get('/logs', getSystemLogs);

export default router;
