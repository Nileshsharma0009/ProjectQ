import React, { useState, useEffect } from 'react';
import { getDashboardStats, getPendingUsers } from '../../services/api';
import {
    Users,
    UserCheck,
    GraduationCap,
    CheckCircle,
    Activity,
    Shield,
    AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        activeLectures: 0,
        attendancePercentage: 0
    });
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                getDashboardStats(),
                getPendingUsers()
            ]);
            setStats(statsRes.data);
            setPendingCount(pendingRes.data.length);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Students</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalStudents}</p>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Teachers</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.totalTeachers}</p>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <GraduationCap size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Lectures</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.activeLectures}</p>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Today's Attendance</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.attendancePercentage}%</p>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Alerts */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Pending Approvals Widget */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Pending Approvals</h2>
                        <Link to="/admin/approvals" className="text-blue-600 text-sm hover:underline">View All</Link>
                    </div>
                    {pendingCount > 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertTriangle className="text-yellow-600" size={24} />
                            <div>
                                <p className="font-semibold text-yellow-800">{pendingCount} New Request{pendingCount > 1 ? 's' : ''}</p>
                                <p className="text-sm text-yellow-700">Student/Teacher approval required.</p>
                            </div>
                            <Link to="/admin/approvals" className="ml-auto px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200">
                                Review
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <UserCheck className="mx-auto mb-2 text-slate-300" size={32} />
                            No pending approvals.
                        </div>
                    )}
                </div>

                {/* Security Status Widget */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">System Security</h2>
                        <Link to="/admin/security-settings" className="text-blue-600 text-sm hover:underline">Configure</Link>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Shield className="text-green-600" size={20} />
                                <span className="font-medium text-slate-700">Security Protocols</span>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">ACTIVE</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            Geo-fencing, Device Binding, and IP restrictions are managed from the settings panel.
                            Ensure all layers are active for maximum security.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
