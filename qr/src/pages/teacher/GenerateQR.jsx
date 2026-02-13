import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/teacher/Sidebar';
import TopNavbar from '../../components/teacher/TopNavbar';
import { QrCode, RefreshCw, Play, StopCircle, Clock, Info, Calendar } from 'lucide-react';
import { createLecture, generateQr, endLecture, getTeacherClassrooms } from '../../services/api';
import QRCodeLib from 'qrcode';

// Subject data based on year
const SUBJECTS_BY_YEAR = {
    '1st Year': [
        'Engineering Mathematics I',
        'Engineering Physics',
        'Engineering Chemistry',
        'Programming in C',
        'Engineering Graphics',
        'Communication Skills'
    ],
    '2nd Year': [
        'Engineering Mathematics II',
        'Data Structures',
        'Digital Electronics',
        'Object Oriented Programming',
        'Database Management Systems',
        'Computer Organization'
    ],
    '3rd Year': [
        'Operating Systems',
        'Computer Networks',
        'Software Engineering',
        'Web Technologies',
        'Design and Analysis of Algorithms',
        'Microprocessors'
    ],
    '4th Year': [
        'Machine Learning',
        'Artificial Intelligence',
        'Cloud Computing',
        'Cyber Security',
        'Mobile Application Development',
        'Project Work'
    ]
};

// Generate block options (Block 1 to Block 15)
const BLOCKS = Array.from({ length: 15 }, (_, i) => `Block ${i + 1}`);

// Year options
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// Branch options
const BRANCHES = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil', 'Electrical', 'IT', 'Chemical', 'Aerospace', 'Biotech'];

const GenerateQR = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const lectureIdFromURL = searchParams.get('lectureId');

    const [classrooms, setClassrooms] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState('Block 1');
    const [selectedYear, setSelectedYear] = useState('1st Year');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [allowedBranches, setAllowedBranches] = useState(['All']); // NEW: Default to 'All'
    const [scheduledTime, setScheduledTime] = useState('');
    const [activeLecture, setActiveLecture] = useState(null);
    const [qrToken, setQrToken] = useState('');
    const [qrImage, setQrImage] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);

    const [totalDuration, setTotalDuration] = useState(30);

    useEffect(() => {
        loadClassrooms();
        // Set default subject when year changes
        if (SUBJECTS_BY_YEAR[selectedYear]?.length > 0) {
            setSelectedSubject(SUBJECTS_BY_YEAR[selectedYear][0]);
        }
    }, [selectedYear]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && qrToken) {
            // QR expired
            setQrToken('');
            setQrImage('');
        }
    }, [countdown, qrToken]);

    const loadClassrooms = async () => {
        try {
            const res = await getTeacherClassrooms();
            setClassrooms(res.data);
        } catch (error) {
            console.error('Error loading classrooms:', error);
        }
    };

    const handleStartLecture = async (e) => {
        e.preventDefault();
        if (!selectedBlock || !selectedYear || !selectedSubject || !scheduledTime) {
            alert('Please fill in all fields');
            return;
        }

        // Client-side validation: Check if scheduled time is within 24 hours
        const scheduled = new Date(scheduledTime);
        const now = new Date();
        const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (scheduled < now) {
            alert('❌ Scheduled time cannot be in the past. Please select a future time.');
            return;
        }

        if (scheduled > twentyFourHoursLater) {
            alert('❌ Lectures can only be scheduled within the next 24 hours (same day).\n\nPlease select a time within today.');
            return;
        }

        try {
            setLoading(true);
            // Create a virtual classroom name combining block and year
            const lectureData = {
                classroomId: classrooms[0]?._id || 'default',  // Use existing or default
                subject: `${selectedSubject} (${selectedYear} - ${selectedBlock})`,
                scheduledTime: scheduledTime,
                allowedBranches: allowedBranches,
                allowedYears: [parseInt(selectedYear)] // Extract year number (e.g., "1st Year" -> 1)  // Include allowed branches
            };

            const res = await createLecture(lectureData);
            setActiveLecture(res.data);
            alert('✅ Lecture started successfully!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to start lecture';
            alert(`❌ ${errorMessage}`);
            console.error('Error creating lecture:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBranchChange = (branch) => {
        if (branch === 'All') {
            // If 'All' is selected, clear other selections and only keep 'All'
            setAllowedBranches(['All']);
        } else {
            // Remove 'All' if specific branch is selected
            let newBranches = allowedBranches.filter(b => b !== 'All');

            if (newBranches.includes(branch)) {
                // Deselect if already selected
                newBranches = newBranches.filter(b => b !== branch);
                // If nothing is selected, default to 'All'
                if (newBranches.length === 0) {
                    newBranches = ['All'];
                }
            } else {
                // Add the branch
                newBranches.push(branch);
            }

            setAllowedBranches(newBranches);
        }
    };

    const handleGenerateQR = async () => {
        if (!activeLecture) {
            alert('No active lecture');
            return;
        }

        try {
            setLoading(true);
            const res = await generateQr(activeLecture._id);
            const token = res.data.qrToken;
            const expiresAt = new Date(res.data.expiresAt); // Get expiry from backend

            // Calculate remaining time in seconds
            const now = new Date();
            const duration = Math.max(0, Math.floor((expiresAt - now) / 1000));

            // Generate QR code image with both lectureId and token
            const qrPayload = JSON.stringify({
                lectureId: activeLecture._id,
                token: token
            });

            const qrDataUrl = await QRCodeLib.toDataURL(qrPayload, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#2563EB',
                    light: '#FFFFFF'
                }
            });

            setQrToken(token);
            setQrImage(qrDataUrl);
            setCountdown(duration);
            setTotalDuration(duration); // Store total duration for progress bar
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate QR');
        } finally {
            setLoading(false);
        }
    };

    const handleEndLecture = async () => {
        if (!activeLecture) return;

        if (!confirm('Are you sure you want to end this lecture?')) return;

        try {
            setLoading(true);
            await endLecture(activeLecture._id);
            setActiveLecture(null);
            setQrToken('');
            setQrImage('');
            setCountdown(0);
            alert('Lecture ended successfully');
            navigate('/teacher/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to end lecture');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <TopNavbar />

                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Generate QR Code</h1>
                            <p className="text-gray-600 mt-1">Start a lecture and generate QR for attendance</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Lecture Info & Controls */}
                            <div className="space-y-6">
                                {!activeLecture ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h2 className="text-xl font-bold text-gray-800 mb-4">Start New Lecture</h2>
                                        <form onSubmit={handleStartLecture} className="space-y-4">
                                            {/* Block Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Select Block
                                                </label>
                                                <select
                                                    value={selectedBlock}
                                                    onChange={(e) => setSelectedBlock(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    {BLOCKS.map((block) => (
                                                        <option key={block} value={block}>
                                                            {block}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Year Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Academic Year
                                                </label>
                                                <select
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    {YEARS.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Subject Selection (Based on Year) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Subject
                                                </label>
                                                <select
                                                    value={selectedSubject}
                                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                >
                                                    {SUBJECTS_BY_YEAR[selectedYear]?.map((subject) => (
                                                        <option key={subject} value={subject}>
                                                            {subject}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Subjects for {selectedYear}
                                                </p>
                                            </div>

                                            {/* Scheduled Time */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    Scheduled Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduledTime}
                                                    onChange={(e) => setScheduledTime(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            {/* Allowed Branches (NEW) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Allowed Branches
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {BRANCHES.map((branch) => (
                                                        <label
                                                            key={branch}
                                                            className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${allowedBranches.includes(branch)
                                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={allowedBranches.includes(branch)}
                                                                onChange={() => handleBranchChange(branch)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm font-medium">{branch}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {allowedBranches.includes('All')
                                                        ? 'All branches can attend this lecture'
                                                        : `Selected: ${allowedBranches.join(', ')}`}
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                            >
                                                <Play size={20} />
                                                {loading ? 'Starting...' : 'Start Lecture'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-bold text-gray-800">Active Lecture</h2>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Live
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500">Subject</p>
                                                <p className="text-lg font-semibold text-gray-800">{activeLecture.subject}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Started At</p>
                                                <p className="text-gray-800">
                                                    {new Date(activeLecture.startTime).toLocaleTimeString()}
                                                </p>
                                            </div>

                                            <div className="pt-4 space-y-3">
                                                <button
                                                    onClick={handleGenerateQR}
                                                    disabled={loading || countdown > 0}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    {countdown > 0 ? <RefreshCw size={20} className="animate-spin" /> : <QrCode size={20} />}
                                                    {countdown > 0 ? `Generating in ${countdown}s` : 'Generate QR Code'}
                                                </button>

                                                <button
                                                    onClick={handleEndLecture}
                                                    disabled={loading}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    <StopCircle size={20} />
                                                    End Lecture
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Card */}
                                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-start gap-3">
                                        <Info className="text-blue-600 flex-shrink-0" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• Select block (Block 1 to Block 15)</li>
                                                <li>• Choose academic year (1st to 4th)</li>
                                                <li>• Pick subject from year-specific list</li>
                                                <li>• Set scheduled time for the lecture</li>
                                                <li>• Generate QR code (valid for 30 seconds)</li>
                                                <li>• Students scan QR to mark attendance</li>
                                                <li>• Regenerate new QR after expiry for security</li>
                                                <li>• End lecture when class is complete</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: QR Display */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">QR Code Display</h2>

                                {!qrImage ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                            <QrCode size={64} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-500">No QR code generated yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Start a lecture and click "Generate QR Code"</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* QR Code */}
                                        <div className="bg-white border-4 border-blue-600 rounded-2xl p-6 shadow-lg">
                                            <img
                                                src={qrImage}
                                                alt="QR Code"
                                                className="w-full max-w-sm mx-auto"
                                            />
                                        </div>

                                        {/* Countdown Timer */}
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Clock size={20} />
                                                <p className="text-sm font-medium">Time Remaining</p>
                                            </div>
                                            <p className="text-5xl font-bold">{countdown}s</p>
                                            <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-white h-full transition-all duration-1000"
                                                    style={{ width: `${(countdown / totalDuration) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerateQR}
                                            disabled={loading || countdown > 10}
                                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        >
                                            <RefreshCw size={20} />
                                            Regenerate QR
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GenerateQR;
