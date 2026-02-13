import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import {
    BarChart3,
    Users,
    BookOpen,
    TrendingUp,
    Download,
    Filter,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    RefreshCw
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

const TeacherAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        branch: 'all',
        year: 'all',
        subject: 'all',
        dateFrom: '',
        dateTo: ''
    });

    // Data states
    const [overviewStats, setOverviewStats] = useState({
        totalLectures: 0,
        totalStudents: 0,
        averageAttendance: 0,
        completedLectures: 0
    });

    const [branchYearData, setBranchYearData] = useState([]);
    const [subjectData, setSubjectData] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState([]);
    const [availableFilters, setAvailableFilters] = useState({
        branches: [],
        years: [],
        subjects: [],
        classes: []
    });

    useEffect(() => {
        loadReportData();
    }, [filters]);

    const loadReportData = async () => {
        try {
            setLoading(true);

            // Build query params
            const params = new URLSearchParams();
            if (filters.branch !== 'all') params.append('branch', filters.branch);
            if (filters.year !== 'all') params.append('year', filters.year);
            if (filters.subject !== 'all') params.append('subject', filters.subject);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);

            // Fetch all report data
            const [overviewRes, branchYearRes, subjectRes, studentRes, filtersRes] = await Promise.all([
                api.get(`/teacher/reports/overview?${params}`),
                api.get(`/teacher/reports/by-branch-year?${params}`),
                api.get(`/teacher/reports/by-subject?${params}`),
                api.get(`/teacher/reports/student-attendance?${params}`),
                api.get('/teacher/reports/available-filters')
            ]);

            setOverviewStats(overviewRes.data);
            setBranchYearData(branchYearRes.data);
            setSubjectData(subjectRes.data);
            setStudentAttendance(studentRes.data);
            setAvailableFilters(filtersRes.data);
        } catch (error) {
            console.error('Error loading report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReportData();
        setRefreshing(false);
    };

    const handleExport = async (type) => {
        try {
            const params = new URLSearchParams();
            if (filters.branch !== 'all') params.append('branch', filters.branch);
            if (filters.year !== 'all') params.append('year', filters.year);
            if (filters.subject !== 'all') params.append('subject', filters.subject);
            if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
            if (filters.dateTo) params.append('dateTo', filters.dateTo);
            params.append('format', type);

            const response = await api.get(`/teacher/reports/export?${params}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting report:', error);
            alert('Failed to export report');
        }
    };

    const clearFilters = () => {
        setFilters({
            branch: 'all',
            year: 'all',
            subject: 'all',
            dateFrom: '',
            dateTo: ''
        });
    };

    const getAttendanceColor = (percentage) => {
        if (percentage >= 75) return 'text-green-600 bg-green-100';
        if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getAttendanceIcon = (percentage) => {
        if (percentage >= 75) return <CheckCircle size={20} className="text-green-600" />;
        if (percentage >= 50) return <AlertCircle size={20} className="text-yellow-600" />;
        return <XCircle size={20} className="text-red-600" />;
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
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
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                        <BarChart3 className="text-blue-600" size={36} />
                                        Attendance Analytics
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Comprehensive attendance reports across all your classes
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRefresh}
                                        disabled={refreshing}
                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                                        Refresh
                                    </button>
                                    <button
                                        onClick={() => handleExport('excel')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <Download size={18} />
                                        Export Excel
                                    </button>
                                    <button
                                        onClick={() => handleExport('pdf')}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <FileText size={18} />
                                        Export PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="text-gray-600" size={20} />
                                <h3 className="font-semibold text-gray-800">Filters</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class (Branch & Year)
                                    </label>
                                    <select
                                        value={(() => {
                                            const val = filters.branch !== 'all' && filters.year !== 'all'
                                                ? `${filters.branch}-${filters.year}`
                                                : 'all';
                                            const exists = availableFilters.classes?.some(c => `${c.branch}-${c.year}` == val);
                                            return exists ? val : 'all';
                                        })()}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'all') {
                                                setFilters({ ...filters, branch: 'all', year: 'all' });
                                            } else {
                                                const [b, y] = val.split('-');
                                                setFilters({ ...filters, branch: b, year: y });
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">Custom / All Classes</option>
                                        {availableFilters.classes?.map((cls, idx) => (
                                            <option key={idx} value={`${cls.branch}-${cls.year}`}>
                                                {cls.branch} - Year {cls.year}
                                            </option>
                                        ))}
                                    </select>
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
                                        {availableFilters.branches.map(branch => (
                                            <option key={branch} value={branch}>{branch}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Years</option>
                                        {availableFilters.years.map(year => (
                                            <option key={year} value={year}>Year {year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        value={filters.subject}
                                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Subjects</option>
                                        {availableFilters.subjects.map(subject => (
                                            <option key={subject} value={subject}>{subject}</option>
                                        ))}
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
                            {(filters.branch !== 'all' || filters.year !== 'all' || filters.subject !== 'all' || filters.dateFrom || filters.dateTo) && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>

                        {/* Overview Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <BookOpen className="text-blue-600" size={32} />
                                    <span className="text-sm font-medium text-gray-500">Total Lectures</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{overviewStats.totalLectures}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    {overviewStats.completedLectures} completed
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="text-purple-600" size={32} />
                                    <span className="text-sm font-medium text-gray-500">Total Students</span>
                                </div>
                                <p className="text-3xl font-bold text-gray-800">{overviewStats.totalStudents}</p>
                                <p className="text-sm text-gray-600 mt-1">Across all classes</p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <TrendingUp className={`${overviewStats.averageAttendance >= 75 ? 'text-green-600' :
                                        overviewStats.averageAttendance >= 50 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`} size={32} />
                                    <span className="text-sm font-medium text-gray-500">Avg Attendance</span>
                                </div>
                                <p className={`text-3xl font-bold ${overviewStats.averageAttendance >= 75 ? 'text-green-600' :
                                    overviewStats.averageAttendance >= 50 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {overviewStats.averageAttendance}%
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Overall performance</p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <Calendar size={32} />
                                    <span className="text-sm font-medium opacity-90">This Month</span>
                                </div>
                                <p className="text-3xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short' })}</p>
                                <p className="text-sm opacity-90 mt-1">{new Date().getFullYear()}</p>
                            </div>
                        </div>

                        {/* Branch & Year Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users className="text-blue-600" size={24} />
                                Branch & Year Breakdown
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Branch</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Year</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total Students</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Lectures</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Attendance</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {branchYearData.length > 0 ? branchYearData.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4">
                                                    <span className="font-semibold text-gray-800">{item.branch}</span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    Year {item.year}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {item.totalStudents}
                                                </td>
                                                <td className="py-3 px-4 text-gray-600">
                                                    {item.lectureCount}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getAttendanceColor(item.averageAttendance)}`}>
                                                        {item.averageAttendance}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getAttendanceIcon(item.averageAttendance)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                                    No data available for selected filters
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subject-wise Performance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="text-purple-600" size={24} />
                                Subject-wise Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subjectData.length > 0 ? subjectData.map((subject, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h4 className="font-semibold text-gray-800 mb-3">{subject.name}</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Lectures:</span>
                                                <span className="font-semibold text-gray-800">{subject.lectureCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Students:</span>
                                                <span className="font-semibold text-gray-800">{subject.studentCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Attendance:</span>
                                                <span className={`font-semibold ${subject.attendance >= 75 ? 'text-green-600' :
                                                    subject.attendance >= 50 ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {subject.attendance}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${subject.attendance >= 75 ? 'bg-green-600' :
                                                    subject.attendance >= 50 ? 'bg-yellow-600' :
                                                        'bg-red-600'
                                                    }`}
                                                style={{ width: `${subject.attendance}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center text-gray-500 py-8">
                                        No subject data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Student-wise Attendance - Grouped by Branch & Year */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users className="text-green-600" size={24} />
                                Student Attendance Records
                            </h3>

                            {(() => {
                                // Group students by branch and year
                                const groupedStudents = {};
                                studentAttendance.forEach(student => {
                                    const key = `${student.branch}-${student.year}`;
                                    if (!groupedStudents[key]) {
                                        groupedStudents[key] = {
                                            branch: student.branch,
                                            year: student.year,
                                            students: []
                                        };
                                    }
                                    groupedStudents[key].students.push(student);
                                });

                                // Sort groups by branch then year
                                const sortedGroups = Object.values(groupedStudents).sort((a, b) => {
                                    if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
                                    return a.year - b.year;
                                });

                                if (sortedGroups.length === 0) {
                                    return (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                            <Users className="mx-auto text-gray-300 mb-4" size={64} />
                                            <p className="text-gray-500 text-lg">No student data available</p>
                                            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                                        </div>
                                    );
                                }

                                return sortedGroups.map((group, groupIdx) => {
                                    // Calculate group stats
                                    const totalStudents = group.students.length;
                                    const avgAttendance = group.students.reduce((sum, s) => sum + s.percentage, 0) / totalStudents;
                                    const highPerformers = group.students.filter(s => s.percentage >= 75).length;
                                    const lowPerformers = group.students.filter(s => s.percentage < 50).length;

                                    return (
                                        <div key={groupIdx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            {/* Group Header */}
                                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-white">
                                                            {group.branch} - Year {group.year}
                                                        </h4>
                                                        <p className="text-blue-100 text-sm mt-1">
                                                            {totalStudents} Students
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-white">
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold">
                                                                {Math.round(avgAttendance)}%
                                                            </p>
                                                            <p className="text-xs text-blue-100">Avg Attendance</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-green-300">
                                                                {highPerformers}
                                                            </p>
                                                            <p className="text-xs text-blue-100">≥75%</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-2xl font-bold text-red-300">
                                                                {lowPerformers}
                                                            </p>
                                                            <p className="text-xs text-blue-100">&lt;50%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Students Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Roll No</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total Lectures</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Present</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Absent</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Percentage</th>
                                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {group.students.map((student, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-3 px-4">
                                                                    <span className="font-mono text-sm font-semibold text-gray-800">
                                                                        {student.rollNo}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <p className="font-semibold text-gray-800">{student.name}</p>
                                                                </td>
                                                                <td className="py-3 px-4 text-gray-600 text-center">
                                                                    {student.totalLectures}
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                                                                        <CheckCircle size={14} />
                                                                        {student.present}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm font-semibold">
                                                                        <XCircle size={14} />
                                                                        {student.absent}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-lg font-bold ${student.percentage >= 75 ? 'text-green-600' :
                                                                            student.percentage >= 50 ? 'text-yellow-600' :
                                                                                'text-red-600'
                                                                            }`}>
                                                                            {student.percentage}%
                                                                        </span>
                                                                        <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className={`h-2 rounded-full ${student.percentage >= 75 ? 'bg-green-600' :
                                                                                    student.percentage >= 50 ? 'bg-yellow-600' :
                                                                                        'bg-red-600'
                                                                                    }`}
                                                                                style={{ width: `${student.percentage}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    {getAttendanceIcon(student.percentage)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Group Footer Summary */}
                                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                                <div className="flex items-center justify-between text-sm">
                                                    <p className="text-gray-600">
                                                        <span className="font-semibold">{totalStudents}</span> students in this class
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-green-600 font-semibold">
                                                            {highPerformers} high performers
                                                        </span>
                                                        {lowPerformers > 0 && (
                                                            <span className="text-red-600 font-semibold">
                                                                {lowPerformers} need attention
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherAnalytics;
