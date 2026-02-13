import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    QrCode,
    BookOpen,
    BarChart3,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        { path: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/teacher/generate-qr', icon: QrCode, label: 'Generate QR' },
        { path: '/teacher/my-lectures', icon: BookOpen, label: 'My Lectures' },
        { path: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/teacher/reports', icon: BarChart3, label: 'Reports' },
        { path: '/teacher/profile', icon: User, label: 'Profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-blue-600">QR Attend</h2>
                <p className="text-sm text-gray-500 mt-1">Teacher Panel</p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex w-64 bg-white flex-col shadow-lg">
                <NavContent />
            </aside>

            {/* Sidebar - Mobile */}
            <aside
                className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-white z-40 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <NavContent />
            </aside>
        </>
    );
};

export default Sidebar;
