import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    Book,
    Calendar,
    Users,
    TrendingUp,
    ArrowLeft,
    Download,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
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

export default function LectureHistory() {
    const navigate = useNavigate();
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        subject: '',
        dateFrom: '',
        dateTo: '',
        branch: 'all'
    });

    useEffect(() => {
        loadLectureHistory();
    }, [currentPage]);

    const loadLectureHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/teacher/lectures/history?page=${currentPage}&limit=10`);
            setLectures(res.data.lectures || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error('Error loading lectures:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateDuration = (start, end) => {
        const duration = new Date(end) - new Date(start);
        const minutes = Math.floor(duration / 60000);
        return `${minutes} min`;
    };

    const getFilteredLectures = () => {
        return lectures.filter(lecture => {
            if (filters.subject && !lecture.subject.toLowerCase().includes(filters.subject.toLowerCase())) {
                return false;
            }
            if (filters.branch !== 'all' && !lecture.allowedBranches.includes(filters.branch)) {
                return false;
            }
            if (filters.dateFrom && new Date(lecture.startTime) < new Date(filters.dateFrom)) {
                return false;
            }
            if (filters.dateTo && new Date(lecture.startTime) > new Date(filters.dateTo)) {
                return false;
            }
            return true;
        });
    };

    const filteredLectures = getFilteredLectures();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <History className="text-blue-600" size={36} />
                                Lecture History
                            </h1>
                            <p className="text-gray-600 mt-2">
                                View all your past lectures
                            </p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-gray-600" size={20} />
                        <h3 className="font-semibold text-gray-800">Filters</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={filters.subject}
                                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                placeholder="Search subject..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Branch
                            </label>
                            <select
                                value={filters.branch}
                                onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Branches</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="ME">ME</option>
                                <option value="EE">EE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {(filters.subject || filters.branch !== 'all' || filters.dateFrom || filters.dateTo) && (
                        <button
                            onClick={() => setFilters({ subject: '', branch: 'all', dateFrom: '', dateTo: '' })}
                            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Lectures List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredLectures.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-200">
                                {filteredLectures.map((lecture) => {
                                    const attendanceCount = lecture.attendance?.length || 0;
                                    const attendancePercentage = lecture.expectedStudents
                                        ? Math.round((attendanceCount / lecture.expectedStudents) * 100)
                                        : 0;

                                    return (
                                        <div key={lecture._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-xl font-bold text-gray-800">
                                                            {lecture.subject}
                                                        </h3>
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                            {lecture.allowedBranches}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Calendar size={16} />
                                                            <span className="text-sm">
                                                                {formatDate(lecture.startTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <History size={16} />
                                                            <span className="text-sm">
                                                                {formatTime(lecture.startTime)} - {formatTime(lecture.endTime)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Users size={16} />
                                                            <span className="text-sm">
                                                                {attendanceCount} / {lecture.expectedStudents || 0} students
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp size={16} className={
                                                                attendancePercentage >= 75 ? 'text-green-600' :
                                                                    attendancePercentage >= 50 ? 'text-yellow-600' :
                                                                        'text-red-600'
                                                            } />
                                                            <span className={`text-sm font-semibold ${attendancePercentage >= 75 ? 'text-green-600' :
                                                                    attendancePercentage >= 50 ? 'text-yellow-600' :
                                                                        'text-red-600'
                                                                }`}>
                                                                {attendancePercentage}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {lecture.classroomId && (
                                                        <p className="text-sm text-gray-600">
                                                            <strong>Classroom:</strong> {lecture.classroomId.name || 'N/A'}
                                                        </p>
                                                    )}

                                                    {lecture.endTime && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <strong>Duration:</strong> {calculateDuration(lecture.startTime, lecture.endTime)}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => navigate(`/teacher/lecture/${lecture._id}`)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Eye size={18} />
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                                        <span className="font-medium">{totalPages}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <ChevronLeft size={18} />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            Next
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <History className="mx-auto text-gray-400 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                No Lecture History
                            </h3>
                            <p className="text-gray-600">
                                {filters.subject || filters.branch !== 'all' || filters.dateFrom || filters.dateTo
                                    ? 'No lectures match your filters'
                                    : 'Your past lectures will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
