import React, { useState, useEffect } from 'react';
import { getSystemLogs } from '../../services/api';
import { Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const res = await getSystemLogs();
            setLogs(res.data);
        } catch (error) {
            console.error('Error loading logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Timestamp</th>
                            <th className="p-4 font-semibold text-slate-600">Type</th>
                            <th className="p-4 font-semibold text-slate-600">Event</th>
                            <th className="p-4 font-semibold text-slate-600">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-slate-500">No logs found.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${log.type === 'Security'
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{log.message}</td>
                                    <td className="p-4 text-slate-500 text-sm">{log.details || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemLogs;
