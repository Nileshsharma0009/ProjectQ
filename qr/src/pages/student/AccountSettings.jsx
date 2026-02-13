import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Shield,
    Smartphone,
    Wifi,
    MapPin,
    Lock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowLeft,
    Save,
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

export default function AccountSettings() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [securitySettings, setSecuritySettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [resetRequested, setResetRequested] = useState(false);

    useEffect(() => {
        loadProfileData();
        loadSecuritySettings();
    }, []);

    const loadProfileData = async () => {
        try {
            const res = await api.get('/student/profile');
            setProfile(res.data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSecuritySettings = async () => {
        try {
            const res = await api.get('/student/settings');
            setSecuritySettings(res.data);
        } catch (error) {
            console.error('Error loading security settings:', error);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        try {
            await api.put('/student/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password'
            });
        }
    };

    const requestDeviceReset = async () => {
        if (confirm('Are you sure you want to request a device reset? Your admin will need to approve this.')) {
            try {
                await api.post('/student/request-device-reset');
                setResetRequested(true);
                setMessage({
                    type: 'success',
                    text: 'Device reset request sent to admin. You will be notified once approved.'
                });
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to request device reset'
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const deviceId = profile?.deviceId || localStorage.getItem('deviceId');
    const ipAddress = profile?.ipAddress;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
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
                        <Settings className="text-blue-600" size={36} />
                        Account Settings
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your security settings and account preferences
                    </p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center gap-2">
                            {message.type === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertTriangle size={20} />
                            )}
                            <p>{message.text}</p>
                        </div>
                    </div>
                )}

                {/* Security Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">Security Status</h2>
                    </div>

                    <div className="space-y-4">
                        {/* Device Binding */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Smartphone className="text-gray-600" size={20} />
                                        <h3 className="font-semibold text-gray-800">Device Binding</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Your account is bound to a specific device for security
                                    </p>
                                    {deviceId && (
                                        <div className="bg-white border border-gray-200 rounded p-3 mt-2">
                                            <p className="text-xs text-gray-500 mb-1">Device ID</p>
                                            <p className="text-sm font-mono text-gray-700 break-all">
                                                {deviceId.substring(0, 32)}...
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {deviceId ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            <CheckCircle size={16} />
                                            Bound
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                            <AlertTriangle size={16} />
                                            Not Bound
                                        </span>
                                    )}
                                </div>
                            </div>
                            {deviceId && !resetRequested && (
                                <button
                                    onClick={requestDeviceReset}
                                    className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <RefreshCw size={16} />
                                    Request Device Reset
                                </button>
                            )}
                            {resetRequested && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        ⏳ Reset request pending admin approval
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* IP Binding */}
                        {securitySettings?.ipBindingEnabled && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wifi className="text-gray-600" size={20} />
                                            <h3 className="font-semibold text-gray-800">IP Address Binding</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Your account is bound to a specific IP address
                                        </p>
                                        {ipAddress && (
                                            <div className="bg-white border border-gray-200 rounded p-3 mt-2">
                                                <p className="text-xs text-gray-500 mb-1">Bound IP</p>
                                                <p className="text-sm font-mono text-gray-700">
                                                    {ipAddress}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        {ipAddress ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                <CheckCircle size={16} />
                                                Bound
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                <AlertTriangle size={16} />
                                                Not Bound
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Geo-Fencing */}
                        {securitySettings?.geoFencingEnabled && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="text-gray-600" size={20} />
                                            <h3 className="font-semibold text-gray-800">Geo-Fencing</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Location verification is required when marking attendance
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Radius: {securitySettings.geoFenceRadius || 50} meters
                                        </p>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            <CheckCircle size={16} />
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="text-blue-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={20} />
                            Update Password
                        </button>
                    </form>
                </div>

                {/* Profile Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Roll Number</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.rollNo}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Branch</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {profile?.branch || profile?.department}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Year</p>
                            <p className="text-lg font-semibold text-gray-800">{profile?.year}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Section</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {profile?.section || profile?.profile?.section || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
