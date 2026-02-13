import React, { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, resetDevice } from '../../services/api';
import { Search, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const res = await getUsers({ role: 'student', search });
            setStudents(res.data);
        } catch (error) {
            console.error('Error loading students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadStudents();
    };

    const handleResetDevice = async (id) => {
        if (!confirm('Are you sure you want to reset the device binding for this student?')) return;
        try {
            await resetDevice(id);
            alert('Device reset successful');
            loadStudents();
        } catch (error) {
            alert('Error resetting device: ' + error.response?.data?.message);
        }
    };

    const toggleStatus = async (user) => {
        try {
            await updateUserStatus(user._id, { isActive: !user.isActive });
            loadStudents();
        } catch (error) {
            alert('Error updating status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search name, email, roll..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Search
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Roll No</th>
                            <th className="p-4 font-semibold text-slate-600">Branch</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600">Device</th>
                            <th className="p-4 font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">No students found.</td></tr>
                        ) : (
                            students.map(student => (
                                <tr key={student._id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900">{student.name}</div>
                                        <div className="text-sm text-slate-500">{student.email}</div>
                                    </td>
                                    <td className="p-4 text-slate-600">{student.rollNo || '-'}</td>
                                    <td className="p-4 text-slate-600">
                                        {student.branch || student.department || '-'}
                                        <span className="text-xs text-slate-400 block">{student.year}</span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleStatus(student)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium border ${student.isActive
                                                    ? 'bg-green-100 text-green-700 border-green-200'
                                                    : 'bg-red-100 text-red-700 border-red-200'
                                                }`}
                                        >
                                            {student.isActive ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {student.deviceResetRequested ? (
                                            <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
                                                <AlertTriangle size={14} /> Reset Requested
                                            </span>
                                        ) : student.deviceId ? (
                                            <span className="text-green-600 text-sm flex items-center gap-1">
                                                <CheckCircle size={14} /> Bound
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">Not Bound</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleResetDevice(student._id)}
                                            title="Reset Device Binding"
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(student)}
                                            title={student.isActive ? "Disable Account" : "Activate Account"}
                                            className={`p-2 rounded-lg transition-colors ${student.isActive
                                                    ? 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                                    : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {student.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageStudents;
