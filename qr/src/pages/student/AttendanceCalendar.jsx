import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Info
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

const AttendanceCalendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        loadCalendarData();
    }, [currentDate]);

    const loadCalendarData = async () => {
        try {
            setLoading(true);
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const res = await api.get(`/student/calendar?month=${month}&year=${year}`);
            setAttendanceData(res.data.attendances || []);
        } catch (error) {
            console.error('Error loading calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getAttendanceForDay = (day) => {
        const dateStr = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
        ).toDateString();

        return attendanceData.filter(att => {
            const attDate = new Date(att.date).toDateString();
            return attDate === dateStr;
        });
    };

    const getDayStatus = (day) => {
        const dayAttendances = getAttendanceForDay(day);
        if (dayAttendances.length === 0) return 'none';

        const hasPresent = dayAttendances.some(att => att.status === 'present');
        const hasAbsent = dayAttendances.some(att => att.status === 'absent');

        if (hasPresent && hasAbsent) return 'mixed';
        if (hasPresent) return 'present';
        if (hasAbsent) return 'absent';
        return 'none';
    };

    const renderCalendar = () => {
        const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
        const weeks = [];
        let days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(
                <div key={`empty-${i}`} className="aspect-square p-2"></div>
            );
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const status = getDayStatus(day);
            const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all ${isToday ? 'border-blue-500' : 'border-transparent'
                        } ${selectedDay === day ? 'ring-2 ring-blue-400' : ''
                        } ${status === 'present'
                            ? 'bg-green-100 hover:bg-green-200 text-green-800'
                            : status === 'absent'
                                ? 'bg-red-100 hover:bg-red-200 text-red-800'
                                : status === 'mixed'
                                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                        }`}
                >
                    <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-lg font-semibold">{day}</span>
                        {status === 'present' && (
                            <CheckCircle size={14} className="mt-1" />
                        )}
                        {status === 'absent' && (
                            <XCircle size={14} className="mt-1" />
                        )}
                        {status === 'mixed' && (
                            <div className="flex gap-1 mt-1">
                                <CheckCircle size={10} />
                                <XCircle size={10} />
                            </div>
                        )}
                    </div>
                </button>
            );

            // Start new week
            if ((startingDayOfWeek + day) % 7 === 0 || day === daysInMonth) {
                weeks.push(
                    <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-2">
                        {days}
                    </div>
                );
                days = [];
            }
        }

        return weeks;
    };

    const changeMonth = (delta) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
        setSelectedDay(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDay(new Date().getDate());
    };

    const selectedDayAttendances = selectedDay ? getAttendanceForDay(selectedDay) : [];

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <CalendarIcon className="text-blue-600" size={36} />
                        Attendance Calendar
                    </h1>
                    <p className="text-gray-600 mt-2">
                        View your attendance history in calendar format
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => changeMonth(-1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft size={24} className="text-gray-600" />
                                </button>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h2>
                                    <button
                                        onClick={goToToday}
                                        className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                                    >
                                        Today
                                    </button>
                                </div>
                                <button
                                    onClick={() => changeMonth(1)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Day Labels */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div
                                        key={day}
                                        className="text-center text-sm font-semibold text-gray-600 py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {renderCalendar()}
                                </div>
                            )}

                            {/* Legend */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded border-2 border-transparent flex items-center justify-center">
                                            <CheckCircle size={14} className="text-green-800" />
                                        </div>
                                        <span className="text-sm text-gray-700">Present</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-red-100 rounded border-2 border-transparent flex items-center justify-center">
                                            <XCircle size={14} className="text-red-800" />
                                        </div>
                                        <span className="text-sm text-gray-700">Absent</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-yellow-100 rounded border-2 border-transparent"></div>
                                        <span className="text-sm text-gray-700">Mixed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-50 rounded border-2 border-transparent"></div>
                                        <span className="text-sm text-gray-700">No Class</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day Details Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            {selectedDay ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                                        {monthNames[currentDate.getMonth()]} {selectedDay}, {currentDate.getFullYear()}
                                    </h3>

                                    {selectedDayAttendances.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedDayAttendances.map((att, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-4 rounded-lg border-2 ${att.status === 'present'
                                                            ? 'bg-green-50 border-green-200'
                                                            : 'bg-red-50 border-red-200'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-800">
                                                            {att.subject}
                                                        </h4>
                                                        {att.status === 'present' ? (
                                                            <CheckCircle className="text-green-600" size={20} />
                                                        ) : (
                                                            <XCircle className="text-red-600" size={20} />
                                                        )}
                                                    </div>
                                                    {att.lectureTime && (
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(att.lectureTime).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    )}
                                                    <p className={`text-sm font-medium mt-2 ${att.status === 'present' ? 'text-green-700' : 'text-red-700'
                                                        }`}>
                                                        {att.status === 'present' ? 'Present' : 'Absent'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Info className="mx-auto text-gray-400 mb-3" size={48} />
                                            <p className="text-gray-600">
                                                No lectures on this day
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarIcon className="mx-auto text-gray-400 mb-3" size={48} />
                                    <p className="text-gray-600">
                                        Click on a date to view details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3">
                        Monthly Summary - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Lectures</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {attendanceData.length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Present</p>
                            <p className="text-2xl font-bold text-green-600">
                                {attendanceData.filter(att => att.status === 'present').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Absent</p>
                            <p className="text-2xl font-bold text-red-600">
                                {attendanceData.filter(att => att.status === 'absent').length}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                            <p className="text-sm text-gray-600">Attendance %</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {attendanceData.length > 0
                                    ? Math.round(
                                        (attendanceData.filter(att => att.status === 'present').length /
                                            attendanceData.length) *
                                        100
                                    )
                                    : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
