import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';

const Reports = () => {
    const [selectedBranch, setSelectedBranch] = useState('CSE');
    const [selectedYear, setSelectedYear] = useState('1');

    const handleDownload = () => {
        alert(`Downloading report for ${selectedBranch} - Year ${selectedYear}...`);
        // Actual implementation would involve backend generation or CSV export
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Attendance Reports</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-slate-700">Generate Report</h2>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Branch</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Civil">Civil</option>
                            <option value="Electrical">Electrical</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            <Download size={20} /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="text-center py-12 text-slate-500">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="font-medium">Report Preview</p>
                    <p className="text-sm">Select filters to generate a report.</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
