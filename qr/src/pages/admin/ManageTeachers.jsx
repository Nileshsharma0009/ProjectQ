import React, { useState, useEffect } from 'react';
import { getUsers, assignTeacherClasses, updateUserStatus } from '../../services/api';
import { Search, Plus, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [assignments, setAssignments] = useState([{ branch: 'CSE', year: '1' }]);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const res = await getUsers({ role: 'teacher' });
            setTeachers(res.data);
        } catch (error) {
            console.error('Error loading teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClasses = (teacher) => {
        setSelectedTeacher(teacher);
        setAssignments(teacher.assignedClasses?.length ? teacher.assignedClasses : [{ branch: 'CSE', year: '1' }]);
        setModalOpen(true);
    };

    const handleSaveAssignments = async () => {
        try {
            await assignTeacherClasses(selectedTeacher._id, { assignedClasses: assignments });
            setModalOpen(false);
            loadTeachers();
            alert('Classes assigned successfully');
        } catch (error) {
            alert('Error assigning classes');
        }
    };

    const addAssignment = () => {
        setAssignments([...assignments, { branch: 'CSE', year: '1' }]);
    };

    const removeAssignment = (index) => {
        setAssignments(assignments.filter((_, i) => i !== index));
    };

    const updateAssignment = (index, field, value) => {
        const newAssignments = [...assignments];
        newAssignments[index] = { ...newAssignments[index], [field]: value };
        setAssignments(newAssignments);
    };

    const toggleStatus = async (user) => {
        if (!confirm(`Are you sure you want to ${user.isActive ? 'disable' : 'activate'} this teacher?`)) return;
        try {
            await updateUserStatus(user._id, { isActive: !user.isActive });
            loadTeachers();
        } catch (error) {
            alert('Error updating status');
        }
    };


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Manage Teachers</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Email</th>
                            <th className="p-4 font-semibold text-slate-600">Department</th>
                            <th className="p-4 font-semibold text-slate-600">Assigned Classes</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
                        ) : teachers.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">No teachers found.</td></tr>
                        ) : (
                            teachers.map(teacher => (
                                <tr key={teacher._id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{teacher.name}</td>
                                    <td className="p-4 text-slate-600">{teacher.email}</td>
                                    <td className="p-4 text-slate-600">{teacher.department || '-'}</td>
                                    <td className="p-4">
                                        {teacher.assignedClasses?.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {teacher.assignedClasses.map((ac, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                                                        {ac.branch} - Year {ac.year}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-xs">None</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${teacher.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {teacher.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleAssignClasses(teacher)}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Assign Classes"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(teacher)}
                                            className={`p-2 rounded-lg transition-colors ${teacher.isActive
                                                ? 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                                : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                            title={teacher.isActive ? "Disable" : "Activate"}
                                        >
                                            {teacher.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Assignment Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Assign Classes to {selectedTeacher?.name}</h2>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {assignments.map((assignment, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <select
                                        value={assignment.branch}
                                        onChange={(e) => updateAssignment(index, 'branch', e.target.value)}
                                        className="p-2 border rounded-md flex-1"
                                    >
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="Mechanical">Mechanical</option>
                                        <option value="Civil">Civil</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="IT">IT</option>
                                    </select>
                                    <select
                                        value={assignment.year}
                                        onChange={(e) => updateAssignment(index, 'year', e.target.value)}
                                        className="p-2 border rounded-md w-24"
                                    >
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                    </select>
                                    <button
                                        onClick={() => removeAssignment(index)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-md"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addAssignment}
                            className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                            <Plus size={16} /> Add Class
                        </button>

                        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAssignments}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Assignments
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageTeachers;
