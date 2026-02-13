import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Admin Services
export const getDashboardStats = () => api.get('/admin/stats');
export const getPendingUsers = () => api.get('/admin/users?status=pending');
export const getUsers = (params) => api.get('/admin/users', { params });
export const approveUser = (id) => api.put(`/admin/users/${id}/approve`);
export const updateUserStatus = (id, data) => api.put(`/admin/users/${id}/status`, data);
export const resetDevice = (id) => api.put(`/admin/users/${id}/reset-device`);
export const assignTeacherClasses = (id, data) => api.put(`/admin/users/${id}/assign-classes`, data);
export const createClassroom = (data) => api.post('/admin/classrooms', data);
export const getClassrooms = () => api.get('/admin/classrooms');
export const getSecuritySettings = () => api.get('/admin/security-settings');
export const updateSecuritySettings = (data) => api.put('/admin/security-settings', data);
export const getSystemLogs = () => api.get('/admin/logs');

// Teacher Services
export const createLecture = (data) => api.post('/teacher/lectures', data);
export const getLectures = () => api.get('/teacher/lectures');
export const getTodaysLectures = () => api.get('/teacher/lectures/today');
export const getLectureDetails = (lectureId) => api.get(`/teacher/lectures/${lectureId}/details`);
export const endLecture = (lectureId) => api.put(`/teacher/lectures/${lectureId}/end`);
export const generateQr = (lectureId) => api.post(`/teacher/lectures/${lectureId}/qr`);
export const getTeacherClassrooms = () => api.get('/teacher/classrooms');
export const getTeacherStats = () => api.get('/teacher/stats');
export const getTeacherAnalytics = () => api.get('/teacher/analytics');

// Student Services
export const markAttendance = (data) => api.post('/attendance/mark', data);
export const getHistory = () => api.get('/attendance/history');

export default api;
