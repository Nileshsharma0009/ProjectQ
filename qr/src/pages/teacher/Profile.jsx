import { useState } from 'react';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Lock } from 'lucide-react';

const TeacherProfile = () => {
    const { user } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                            <p className="text-gray-600 mt-1">Manage your account information</p>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                                    {user?.name?.charAt(0) || 'T'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                                    <p className="text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <User size={16} />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Mail size={16} />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                        <Shield size={16} />
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.role || ''}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 capitalize"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Security</h3>

                            {!isChangingPassword ? (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Lock size={18} />
                                    Change Password
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => alert('Password change functionality to be implemented')}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Update Password
                                        </button>
                                        <button
                                            onClick={() => setIsChangingPassword(false)}
                                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherProfile;
