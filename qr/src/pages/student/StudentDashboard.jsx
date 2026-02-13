import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    History,
    User,
    LogOut,
    QrCode,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Settings
} from 'lucide-react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [activeLectures, setActiveLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [summaryRes, lecturesRes] = await Promise.all([
                api.get('/student/summary'),
                api.get('/student/active-lectures')
            ]);

            setSummary(summaryRes.data);
            setActiveLectures(Array.isArray(lecturesRes.data) ? lecturesRes.data : []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/student/scan-qr', icon: QrCode, label: 'Scan QR' },
        { path: '/student/history', icon: History, label: 'History' },
        { path: '/student/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/student/profile', icon: User, label: 'Profile' },
        { path: '/student/settings', icon: Settings, label: 'Settings' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="px-6 py-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-blue-600">QR Attendance</h1>
                        <p className="text-sm text-gray-600 mt-1">Student Portal</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            ☰
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">Student Dashboard</h2>
                        <div className="text-sm text-gray-600">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">

                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
                        <h3 className="text-2xl font-bold mb-4">Welcome, {summary?.student?.name || 'Student'}! 👋</h3>
                        {summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-blue-200 text-sm">Roll No</p>
                                    <p className="text-lg font-semibold">{summary.student.rollNo}</p>
                                </div>
                                <div>
                                    <p className="text-blue-200 text-sm">Branch</p>
                                    <p className="text-lg font-semibold">{summary.student.branch}</p>
                                </div>
                                <div>
                                    <p className="text-blue-200 text-sm">Year</p>
                                    <p className="text-lg font-semibold">{summary.student.year}</p>
                                </div>
                                <div>
                                    <p className="text-blue-200 text-sm">Device Status</p>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        {summary.student.deviceStatus === 'Verified' ? (
                                            <><CheckCircle size={18} /> Verified</>
                                        ) : (
                                            <><XCircle size={18} /> Not Verified</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Attendance Summary Cards */}
                    {summary && summary.summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <LayoutDashboard className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Total Lectures</p>
                                        <p className="text-3xl font-bold text-gray-800">{summary.summary.totalLectures}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Present</p>
                                        <p className="text-3xl font-bold text-green-600">{summary.summary.present}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <XCircle className="text-red-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Absent</p>
                                        <p className="text-3xl font-bold text-red-600">{summary.summary.absent}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <TrendingUp className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Attendance %</p>
                                        <p className="text-3xl font-bold text-purple-600">{summary.summary.attendancePercentage}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Lectures */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Active Lectures</h3>
                        {activeLectures.length > 0 ? (
                            <div className="space-y-4">
                                {activeLectures.map((lecture) => (
                                    <div key={lecture._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-800">{lecture.subject}</h4>
                                                <p className="text-sm text-gray-600">
                                                    By {lecture.teacherId?.name || 'Unknown Teacher'} • {lecture.classroomId?.name || 'Unknown Classroom'}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    <Clock size={14} className="inline mr-1" />
                                                    Started: {lecture.startTime ? new Date(lecture.startTime).toLocaleTimeString() : 'N/A'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => navigate('/student/scan-qr', {
                                                    state: {
                                                        lectureId: lecture._id,
                                                        subject: lecture.subject
                                                    }
                                                })}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                                            >
                                                <QrCode size={20} />
                                                Scan QR
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-lg font-medium">No Active Lectures</p>
                                <p className="text-sm">Check back when your teacher starts a class</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentDashboard;
