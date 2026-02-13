import { useState, useEffect } from 'react';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { getTeacherAnalytics } from '../../services/api';

const Reports = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const res = await getTeacherAnalytics();
            setAnalytics(res.data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
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

    const maxMonthlyPercentage = analytics?.monthlyGraph?.length > 0
        ? Math.max(...analytics.monthlyGraph.map(m => m.percentage))
        : 100;

    const maxClassPercentage = analytics?.classWisePerformance?.length > 0
        ? Math.max(...analytics.classWisePerformance.map(c => c.percentage))
        : 100;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Attendance Reports</h1>
                            <p className="text-gray-600 mt-1">View analytics and performance metrics</p>
                        </div>

                        {/* Monthly Attendance Graph */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <TrendingUp size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Monthly Attendance Trend</h2>
                                    <p className="text-sm text-gray-500">Last 6 months performance</p>
                                </div>
                            </div>

                            {!analytics?.monthlyGraph || analytics.monthlyGraph.length === 0 ? (
                                <div className="text-center py-12">
                                    <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500">No data available yet</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analytics.monthlyGraph.map((data, index) => (
                                        <div key={index}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{data.month}</span>
                                                <span className="text-sm font-bold text-blue-600">{data.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                    style={{ width: `${(data.percentage / maxMonthlyPercentage) * 100}%` }}
                                                >
                                                    {data.percentage > 10 && (
                                                        <span className="text-xs font-medium text-white">{data.percentage}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Class-wise Performance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <PieChart size={24} className="text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Class-wise Performance</h2>
                                    <p className="text-sm text-gray-500">Attendance by classroom</p>
                                </div>
                            </div>

                            {!analytics?.classWisePerformance || analytics.classWisePerformance.length === 0 ? (
                                <div className="text-center py-12">
                                    <PieChart className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500">No data available yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {analytics.classWisePerformance.map((classData, index) => {
                                        const colors = [
                                            'from-blue-500 to-blue-600',
                                            'from-purple-500 to-purple-600',
                                            'from-green-500 to-green-600',
                                            'from-orange-500 to-orange-600',
                                            'from-pink-500 to-pink-600',
                                            'from-indigo-500 to-indigo-600'
                                        ];
                                        const color = colors[index % colors.length];

                                        return (
                                            <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                <h3 className="font-bold text-gray-800 text-lg mb-2">{classData.class}</h3>
                                                <p className="text-sm text-gray-500 mb-4">
                                                    {classData.totalLectures} lecture{classData.totalLectures !== 1 ? 's' : ''}
                                                </p>

                                                {/* Circular Progress */}
                                                <div className="relative w-32 h-32 mx-auto mb-4">
                                                    <svg className="transform -rotate-90 w-32 h-32">
                                                        {/* Background circle */}
                                                        <circle
                                                            cx="64"
                                                            cy="64"
                                                            r="56"
                                                            stroke="currentColor"
                                                            strokeWidth="12"
                                                            fill="none"
                                                            className="text-gray-200"
                                                        />
                                                        {/* Progress circle */}
                                                        <circle
                                                            cx="64"
                                                            cy="64"
                                                            r="56"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="12"
                                                            fill="none"
                                                            strokeDasharray={`${(classData.percentage / 100) * 352} 352`}
                                                            className="text-blue-600"
                                                        />
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" className={`text-${color.split('-')[0]}-500`} stopColor="currentColor" />
                                                                <stop offset="100%" className={`text-${color.split('-')[0]}-600`} stopColor="currentColor" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-gray-800">{classData.percentage}%</span>
                                                    </div>
                                                </div>

                                                {/* Bar */}
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                                                        style={{ width: `${classData.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Reports;
