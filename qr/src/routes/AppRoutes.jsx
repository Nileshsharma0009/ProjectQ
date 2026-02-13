import { Routes, Route } from 'react-router-dom';
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Approvals from '../pages/admin/Approvals';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import GenerateQR from '../pages/teacher/GenerateQR';
import MyLectures from '../pages/teacher/MyLectures';
import LectureDetail from '../pages/teacher/LectureDetail';
import Reports from '../pages/teacher/Reports';
import TeacherProfile from '../pages/teacher/Profile';
import TeacherAnalytics from '../pages/teacher/TeacherAnalytics';
import StudentDashboard from '../pages/student/StudentDashboard';
import Profile from '../pages/student/Profile';
import ScanQR from '../pages/student/ScanQR';
import Attendance from '../pages/student/Attendance';
import AttendanceCalendar from '../pages/student/AttendanceCalendar';
import AccountSettings from '../pages/student/AccountSettings';
import AdminLayout from '../components/layout/AdminLayout';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageTeachers from '../pages/admin/ManageTeachers';
import ManageClasses from '../pages/admin/ManageClasses';
import SecuritySettings from '../pages/admin/SecuritySettings';
import AdminReports from '../pages/admin/Reports'; // Renamed to avoid conflict with teacher Reports
import SystemLogs from '../pages/admin/SystemLogs';
import RoleBasedRoute from './RoleBasedRoute';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route element={<RoleBasedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/approvals" element={<Approvals />} />

                    {/* New Pages */}
                    <Route path="/admin/students" element={<ManageStudents />} />
                    <Route path="/admin/teachers" element={<ManageTeachers />} />
                    <Route path="/admin/classrooms" element={<ManageClasses />} />
                    <Route path="/admin/security-settings" element={<SecuritySettings />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/logs" element={<SystemLogs />} />
                </Route>
            </Route>

            {/* Teacher Routes */}
            <Route element={<RoleBasedRoute requiredRole="teacher" />}>
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/generate-qr" element={<GenerateQR />} />
                <Route path="/teacher/my-lectures" element={<MyLectures />} />
                <Route path="/teacher/lecture/:id" element={<LectureDetail />} />
                <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
                <Route path="/teacher/reports" element={<Reports />} />
                <Route path="/teacher/profile" element={<TeacherProfile />} />
            </Route>

            {/* Student Routes */}
            <Route element={<RoleBasedRoute requiredRole="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<Profile />} />
                <Route path="/student/scan-qr" element={<ScanQR />} />
                <Route path="/student/history" element={<Attendance />} />
                <Route path="/student/calendar" element={<AttendanceCalendar />} />
                <Route path="/student/settings" element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
