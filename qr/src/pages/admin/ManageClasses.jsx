import React, { useState, useEffect } from 'react';
import { createClassroom, getClassrooms } from '../../services/api';
import { MapPin, Plus, Trash2 } from 'lucide-react';

const ManageClasses = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newClassroom, setNewClassroom] = useState({
        name: '',
        latitude: '',
        longitude: '',
        radius: 50
    });

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = async () => {
        try {
            const res = await getClassrooms();
            setClassrooms(res.data);
        } catch (error) {
            console.error('Error loading classrooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createClassroom(newClassroom);
            setNewClassroom({ name: '', latitude: '', longitude: '', radius: 50 });
            setShowForm(false);
            loadClassrooms();
            alert('Classroom created successfully');
        } catch (error) {
            alert('Error creating classroom');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Manage Classrooms</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={20} /> Add Classroom
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-fade-in-down">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">New Classroom Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Classroom Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Room 101, Lab A"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newClassroom.name}
                                    onChange={e => setNewClassroom({ ...newClassroom, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Geofence Radius (meters)</label>
                                <input
                                    type="number"
                                    placeholder="50"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newClassroom.radius}
                                    onChange={e => setNewClassroom({ ...newClassroom, radius: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Latitude</label>
                                <input
                                    type="number" step="any"
                                    placeholder="19.123456"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newClassroom.latitude}
                                    onChange={e => setNewClassroom({ ...newClassroom, latitude: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Longitude</label>
                                <input
                                    type="number" step="any"
                                    placeholder="72.654321"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newClassroom.longitude}
                                    onChange={e => setNewClassroom({ ...newClassroom, longitude: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                    <div key={classroom._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <MapPin size={24} />
                            </div>
                            {/* Actions if needed */}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{classroom.name}</h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p>Lat: {classroom.latitude}</p>
                            <p>Lon: {classroom.longitude}</p>
                            <p>Radius: {classroom.radius} meters</p>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && classrooms.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No classrooms found. Create one to get started.
                </div>
            )}
        </div>
    );
};

export default ManageClasses;
