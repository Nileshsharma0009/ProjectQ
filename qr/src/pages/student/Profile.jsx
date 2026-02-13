import { useState, useEffect } from 'react';
import { User, Smartphone, ShieldCheck } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-slate-800">My Profile</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-blue-600 p-8 text-center">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-blue-600 mb-4 shadow-lg">
                        <User size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-blue-100 capitalize">{user.role}</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="bg-white p-2 rounded-lg text-slate-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                            <p className="font-medium text-slate-900">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="bg-white p-2 rounded-lg text-slate-600 shadow-sm">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Device Status</p>
                            <p className="font-medium text-slate-900">
                                {localStorage.getItem('deviceId') ? 'Bound to this device' : 'Not bound'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
