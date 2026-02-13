import { useAuth } from '../../context/AuthContext';
import { Bell, Calendar } from 'lucide-react';

const TopNavbar = () => {
    const { user } = useAuth();

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Date */}
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={20} />
                    <span className="text-sm font-medium">{currentDate}</span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Teacher'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0) || 'T'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopNavbar;
