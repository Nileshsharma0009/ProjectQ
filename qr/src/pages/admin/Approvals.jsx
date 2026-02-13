import React, { useState, useEffect } from 'react';
import { getPendingUsers, updateUserStatus } from '../../services/api';
import { CheckCircle, XCircle, User, GraduationCap } from 'lucide-react';

export default function Approvals() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('student');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getPendingUsers();
            setPendingUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await updateUserStatus(id, { status });
            setPendingUsers(pendingUsers.filter(u => u._id !== id));
            // alert(`User ${status} successfully`);
        } catch (error) {
            alert(`Error ${status} user`);
        }
    };

    const filteredUsers = pendingUsers.filter(u => u.role === activeTab);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading approvals...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('student')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'student'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <User size={18} /> Students
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                            {pendingUsers.filter(u => u.role === 'student').length}
                        </span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('teacher')}
                    className={`pb-3 px-4 font-medium transition-colors ${activeTab === 'teacher'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <GraduationCap size={18} /> Teachers
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                            {pendingUsers.filter(u => u.role === 'teacher').length}
                        </span>
                    </div>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <p>No pending {activeTab} approvals.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Name</th>
                                <th className="p-4 font-semibold text-slate-600">Email</th>
                                <th className="p-4 font-semibold text-slate-600">Details</th>
                                <th className="p-4 font-semibold text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{user.name}</td>
                                    <td className="p-4 text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                        {user.role === 'student' ? (
                                            <div className="text-sm">
                                                <p><span className="text-slate-500">Branch:</span> {user.branch}</p>
                                                <p><span className="text-slate-500">Year:</span> {user.year}</p>
                                                <p><span className="text-slate-500">Roll:</span> {user.rollNo}</p>
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                <p><span className="text-slate-500">Dept:</span> {user.department}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleAction(user._id, 'approved')}
                                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleAction(user._id, 'rejected')}
                                            className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition"
                                        >
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
