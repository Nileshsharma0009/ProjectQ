import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('student'); // Default role
    const { user } = useAuth();

    // Redirect if already logged in
    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
        if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
        return <Navigate to="/student/dashboard" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create new account'}
                    </h2>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        className={`px-4 py-2 rounded-full ${role === 'student' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setRole('student')}
                    >
                        Student
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setRole('teacher')}
                    >
                        Teacher
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full ${role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                {isLogin ? <LoginForm role={role} /> : <RegisterForm role={role} />}

                <div className="text-center mt-4">
                    <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}
