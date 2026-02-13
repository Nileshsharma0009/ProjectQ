import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import {
    BookOpen,
    Eye,
    Calendar,
    Clock,
    Filter,
    StopCircle,
    X,
    CheckCircle,
    Users,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { getLectures } from '../../services/api';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const MyLectures = () => {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [filteredLectures, setFilteredLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [endingLecture, setEndingLecture] = useState(null);
    const [showEndModal, setShowEndModal] = useState(false);
    const [endLoading, setEndLoading] = useState(false);

    useEffect(() => {
        loadLectures();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filter, lectures]);

    const loadLectures = async () => {
        try {
            setLoading(true);
            const res = await getLectures();
            setLectures(res.data);
        } catch (error) {
            console.error('Error loading lectures:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (filter === 'all') {
            setFilteredLectures(lectures);
        } else if (filter === 'active') {
            setFilteredLectures(lectures.filter(l => l.isActive));
        } else if (filter === 'completed') {
            setFilteredLectures(lectures.filter(l => !l.isActive && l.endTime));
        }
    };

    const handleEndLecture = async (lecture) => {
        setEndingLecture(lecture);
        setShowEndModal(true);
    };

    const confirmEndLecture = async () => {
        if (!endingLecture) return;

        try {
            setEndLoading(true);
            await api.put(`/teacher/lecture/${endingLecture._id}/end`);

            // Reload lectures after ending
            await loadLectures();

            // Close modal
            setShowEndModal(false);
            setEndingLecture(null);
        } catch (error) {
            console.error('Error ending lecture:', error);
            alert(error.response?.data?.message || 'Failed to end lecture');
        } finally {
            setEndLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDuration = (start, end) => {
        if (!end) {
            const diff = new Date() - new Date(start);
            const minutes = Math.floor(diff / 60000);
            return `${minutes} min (ongoing)`;
        }
        const diff = new Date(end) - new Date(start);
        const minutes = Math.floor(diff / 60000);
        return `${minutes} min`;
    };

    const getLectureStatus = (lecture) => {
        if (lecture.isActive) return { text: 'Active', color: 'bg-green-500' };
        if (lecture.endTime) return { text: 'Completed', color: 'bg-gray-500' };
        return { text: 'Pending', color: 'bg-yellow-500' };
    };

    const getAttendanceStats = (lecture) => {
        const totalPresent = lecture.attendance?.length || 0;
        const expectedStudents = lecture.expectedStudents || 0;
        const percentage = expectedStudents > 0
            ? Math.round((totalPresent / expectedStudents) * 100)
            : 0;

        return { totalPresent, expectedStudents, percentage };
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">My Lectures</h1>
                            <p className="text-gray-600 mt-1">View and manage all your lectures</p>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                            <div className="flex items-center gap-4">
                                <Filter size={20} className="text-gray-500" />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        All ({lectures.length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('active')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Active ({lectures.filter(l => l.isActive).length})
                                    </button>
                                    <button
                                        onClick={() => setFilter('completed')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'completed'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Completed ({lectures.filter(l => !l.isActive && l.endTime).length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lectures List */}
                        {filteredLectures.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
                                <p className="text-gray-500 text-lg">No lectures found</p>
                                <p className="text-gray-400 text-sm mt-2">Start a new lecture to see it here</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Subject</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Class</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Time</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Duration</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredLectures.map((lecture) => {
                                                const status = getLectureStatus(lecture);
                                                return (
                                                    <tr key={lecture._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <p className="font-semibold text-gray-800">{lecture.subject}</p>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600">
                                                            {lecture.classroomId?.name || 'N/A'}
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={14} />
                                                                {formatDate(lecture.createdAt)}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={14} />
                                                                {formatTime(lecture.startTime)}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-gray-600">
                                                            {getDuration(lecture.startTime, lecture.endTime)}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {lecture.isActive && (
                                                                    <button
                                                                        onClick={() => handleEndLecture(lecture)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                                    >
                                                                        <StopCircle size={16} />
                                                                        End Lecture
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => navigate(`/teacher/lecture/${lecture._id}`)}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                                >
                                                                    <Eye size={16} />
                                                                    View
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* End Lecture Modal */}
            {showEndModal && endingLecture && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <StopCircle className="text-white" size={28} />
                                    <h2 className="text-xl font-bold text-white">End Lecture</h2>
                                </div>
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="text-white hover:bg-red-800 rounded-lg p-1 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Lecture Info */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">
                                    {endingLecture.subject}
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Classroom</p>
                                        <p className="font-semibold text-gray-800">
                                            {endingLecture.classroomId?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Started At</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatTime(endingLecture.startTime)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Duration</p>
                                        <p className="font-semibold text-gray-800">
                                            {getDuration(endingLecture.startTime, new Date())}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Date</p>
                                        <p className="font-semibold text-gray-800">
                                            {formatDate(endingLecture.startTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Users size={18} className="text-blue-600" />
                                    Attendance Summary
                                </h4>
                                {(() => {
                                    const stats = getAttendanceStats(endingLecture);
                                    return (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {stats.totalPresent}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">Present</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <p className="text-2xl font-bold text-gray-600">
                                                    {stats.expectedStudents}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">Expected</p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 text-center">
                                                <p className={`text-2xl font-bold ${stats.percentage >= 75 ? 'text-green-600' :
                                                        stats.percentage >= 50 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {stats.percentage}%
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">Attendance</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-800">
                                            Are you sure you want to end this lecture?
                                        </p>
                                        <p className="text-xs text-yellow-700 mt-1">
                                            Students will no longer be able to mark attendance after you end this lecture.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    disabled={endLoading}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmEndLecture}
                                    disabled={endLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {endLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Ending...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} />
                                            End Lecture
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyLectures;
