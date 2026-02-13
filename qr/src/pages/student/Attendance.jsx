import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    History,
    CheckCircle,
    XCircle,
    Calendar,
    User,
    Book,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Filter,
    Download
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

export default function Attendance() {
    const navigate = useNavigate();
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        status: 'all',
        dateFrom: '',
        dateTo: '',
        subject: ''
    });

    useEffect(() => {
        loadAttendanceHistory();
    }, [currentPage]);

    const loadAttendanceHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/student/history?page=${currentPage}&limit=10`);
            setAttendanceData(res.data.attendances || []);
            setTotalPages(res.data.totalPages || 1);
            setTotal(res.data.total || 0);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFilteredData = () => {
        let filtered = attendanceData;

        if (filters.status !== 'all') {
            filtered = filtered.filter(att => att.status === filters.status);
        }

        if (filters.subject) {
            filtered = filtered.filter(att =>
                att.lectureId?.subject?.toLowerCase().includes(filters.subject.toLowerCase())
            );
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(att =>
                new Date(att.markedAt) >= new Date(filters.dateFrom)
            );
        }

        if (filters.dateTo) {
            filtered = filtered.filter(att =>
                new Date(att.markedAt) <= new Date(filters.dateTo)
            );
        }

        return filtered;
    };

    const filteredData = getFilteredData();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <History className="text-blue-600" size={36} />
                                Attendance History
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Total Records: {total}
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
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                            </select>
                        </div>
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
                    {(filters.status !== 'all' || filters.subject || filters.dateFrom || filters.dateTo) && (
                        <button
                            onClick={() => setFilters({ status: 'all', dateFrom: '', dateTo: '', subject: '' })}
                            className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredData.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Subject
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Teacher
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredData.map((attendance) => (
                                            <tr key={attendance._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="text-gray-400" size={16} />
                                                        <span className="text-sm text-gray-800">
                                                            {formatDate(attendance.markedAt)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Book className="text-gray-400" size={16} />
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {attendance.lectureId?.subject || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="text-gray-400" size={16} />
                                                        <span className="text-sm text-gray-600">
                                                            {attendance.lectureId?.teacherId?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">
                                                        {formatTime(attendance.lectureId?.startTime || attendance.markedAt)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {attendance.status === 'present' ? (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                            <CheckCircle size={16} />
                                                            Present
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                            <XCircle size={16} />
                                                            Absent
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(currentPage * 10, total)}
                                        </span> of{' '}
                                        <span className="font-medium">{total}</span> results
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
                                        <div className="flex items-center gap-2 px-4">
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        </div>
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
                                No Attendance Records
                            </h3>
                            <p className="text-gray-600">
                                {filters.status !== 'all' || filters.subject || filters.dateFrom || filters.dateTo
                                    ? 'No records match your filters'
                                    : 'Your attendance history will appear here'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
