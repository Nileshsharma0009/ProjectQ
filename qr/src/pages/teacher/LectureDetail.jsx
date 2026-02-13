import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import { ArrowLeft, Users, CheckCircle, XCircle, Download, Calendar, Clock } from 'lucide-react';
import { getLectureDetails } from '../../services/api';

const LectureDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLectureDetails();
    }, [id]);

    const loadLectureDetails = async () => {
        try {
            setLoading(true);
            const res = await getLectureDetails(id);
            setLecture(res.data.lecture);
            setAttendance(res.data.attendance);
        } catch (error) {
            console.error('Error loading lecture details:', error);
            alert(error.response?.data?.message || 'Failed to load lecture details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
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

    const exportCSV = () => {
        if (!attendance || !attendance.students.length) {
            alert('No data to export');
            return;
        }

        const headers = ['Name', 'Email', 'Roll No', 'Status', 'Marked At'];
        const rows = attendance.students.map(record => [
            record.studentId?.name || 'N/A',
            record.studentId?.email || 'N/A',
            record.studentId?.rollNo || 'N/A',
            record.status,
            new Date(record.markedAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${lecture.subject}_${formatDate(lecture.createdAt)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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

    if (!lecture) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Lecture not found</p>
                </div>
            </div>
        );
    }

    const attendancePercentage = attendance.total > 0
        ? Math.round((attendance.present / attendance.total) * 100)
        : 0;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate('/teacher/my-lectures')}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
                        >
                            <ArrowLeft size={20} />
                            Back to Lectures
                        </button>

                        {/* Lecture Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{lecture.subject}</h1>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Classroom</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {lecture.classroomId?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Date</p>
                                    <div className="flex items-center gap-2 text-gray-800">
                                        <Calendar size={18} />
                                        <p className="text-lg font-semibold">{formatDate(lecture.createdAt)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Time</p>
                                    <div className="flex items-center gap-2 text-gray-800">
                                        <Clock size={18} />
                                        <p className="text-lg font-semibold">{formatTime(lecture.startTime)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <Users size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Students</p>
                                        <p className="text-2xl font-bold text-gray-800">{attendance.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <CheckCircle size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Present</p>
                                        <p className="text-2xl font-bold text-gray-800">{attendance.present}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <XCircle size={24} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Absent</p>
                                        <p className="text-2xl font-bold text-gray-800">{attendance.absent}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                                <p className="text-sm opacity-90 mb-1">Attendance Rate</p>
                                <p className="text-4xl font-bold">{attendancePercentage}%</p>
                                <div className="mt-3 bg-white/20 rounded-full h-2">
                                    <div
                                        className="bg-white h-full rounded-full transition-all"
                                        style={{ width: `${attendancePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">Student Attendance</h2>
                                <button
                                    onClick={exportCSV}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    <Download size={18} />
                                    Export CSV
                                </button>
                            </div>

                            {attendance.students.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Users className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500">No attendance records yet</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">#</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Roll No</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Marked At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attendance.students.map((record, index) => (
                                                <tr key={record._id} className="hover:bg-gray-50">
                                                    <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                                                    <td className="py-4 px-6">
                                                        <p className="font-semibold text-gray-800">
                                                            {record.studentId?.name || 'N/A'}
                                                        </p>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600">
                                                        {record.studentId?.rollNo || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600">
                                                        {record.studentId?.email || 'N/A'}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {record.status === 'present' ? (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                                <CheckCircle size={14} />
                                                                Present
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                                <XCircle size={14} />
                                                                Absent
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-600">
                                                        {record.markedAt ? formatTime(record.markedAt) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
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

export default LectureDetail;
