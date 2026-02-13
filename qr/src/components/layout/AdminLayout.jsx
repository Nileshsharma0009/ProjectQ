import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    GraduationCap,
    School,
    Shield,
    FileBarChart,
    Activity,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/approvals', label: 'Approvals', icon: UserCheck },
        { path: '/admin/students', label: 'Manage Students', icon: Users },
        { path: '/admin/teachers', label: 'Manage Teachers', icon: GraduationCap },
        { path: '/admin/classrooms', label: 'Manage Classes', icon: School },
        { path: '/admin/security-settings', label: 'Security Settings', icon: Shield },
        { path: '/admin/reports', label: 'Reports', icon: FileBarChart },
        { path: '/admin/logs', label: 'System Logs', icon: Activity },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-6 bg-slate-800">
                        <span className="text-xl font-bold tracking-wider text-blue-400">ADMIN PORTAL</span>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className="mr-3" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <LogOut size={20} className="mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;
