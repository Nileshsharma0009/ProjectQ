import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import StatCard from '../../components/teacher/StatCard';
import { BookOpen, Calendar, Users, TrendingUp, PlayCircle, Eye, Clock } from 'lucide-react';
import api from '../../services/api';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalLectures: 0,
        lecturesThisWeek: 0,
        totalStudents: 0,
        averageAttendance: 0
    });
    const [todaysLectures, setTodaysLectures] = useState([]);
    const [recentLectures, setRecentLectures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, todayRes, lecturesRes] = await Promise.all([
                api.get('/teacher/stats'),
                api.get('/teacher/lectures/today'),
                api.get('/teacher/lectures')
            ]);

            setStats(statsRes.data);
            setTodaysLectures(todayRes.data);
            setRecentLectures(lecturesRes.data.slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getLectureStatus = (lecture) => {
        if (lecture.isActive) return { text: 'Live', color: 'bg-green-500' };
        if (lecture.endTime) return { text: 'Completed', color: 'bg-gray-500' };
        return { text: 'Scheduled', color: 'bg-blue-500' };
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Welcome Section */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                            <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                icon={BookOpen}
                                title="Total Lectures"
                                value={stats.totalLectures}
                                color="blue"
                            />
                            <StatCard
                                icon={Calendar}
                                title="This Week"
                                value={stats.lecturesThisWeek}
                                subtitle="Lectures conducted"
                                color="green"
                            />
                            <StatCard
                                icon={Users}
                                title="Total Students"
                                value={stats.totalStudents}
                                color="purple"
                            />
                            <StatCard
                                icon={TrendingUp}
                                title="Avg Attendance"
                                value={`${stats.averageAttendance}%`}
                                color="orange"
                            />
                        </div>

                        {/* Today's Lectures Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Today's Lectures</h2>
                                <button
                                    onClick={() => navigate('/teacher/generate-qr')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <PlayCircle size={18} />
                                    Start New Lecture
                                </button>
                            </div>

                            {todaysLectures.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto text-gray-300" size={48} />
                                    <p className="text-gray-500 mt-4">No lectures scheduled for today</p>
                                    <button
                                        onClick={() => navigate('/teacher/generate-qr')}
                                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Start a lecture now →
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todaysLectures.map((lecture) => {
                                        const status = getLectureStatus(lecture);
                                        return (
                                            <div
                                                key={lecture._id}
                                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{lecture.subject}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {lecture.classroomId?.name} • {formatTime(lecture.startTime)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                    {lecture.isActive && (
                                                        <button
                                                            onClick={() => navigate(`/teacher/generate-qr?lectureId=${lecture._id}`)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                        >
                                                            Generate QR
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Recent Lecture Activity */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
                                <button
                                    onClick={() => navigate('/teacher/my-lectures')}
                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View All →
                                </button>
                            </div>

                            {recentLectures.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto text-gray-300" size={48} />
                                    <p className="text-gray-500 mt-4">No lecture history yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Class</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLectures.map((lecture) => {
                                                const status = getLectureStatus(lecture);
                                                return (
                                                    <tr key={lecture._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <p className="font-medium text-gray-800">{lecture.subject}</p>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600">{lecture.classroomId?.name || 'N/A'}</td>
                                                        <td className="py-3 px-4 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} />
                                                                {formatDate(lecture.createdAt)}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <button
                                                                onClick={() => navigate(`/teacher/lecture/${lecture._id}`)}
                                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 ml-auto"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;
