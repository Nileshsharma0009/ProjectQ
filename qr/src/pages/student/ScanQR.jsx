import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    QrCode,
    MapPin,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Camera,
    Loader,
    ArrowLeft
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

const ScanQR = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lectureIdFromState = location.state?.lectureId;
    const subjectFromState = location.state?.subject;

    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [clientIp, setClientIp] = useState('Loading...');
    const [locationDisplay, setLocationDisplay] = useState('Waiting for permission...');
    const [geoPermission, setGeoPermission] = useState(null);

    useEffect(() => {
        checkGeoPermission();

        // Fetch public IP
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setClientIp(data.ip))
            .catch(() => setClientIp('Unknown'));

        // Watch location for display
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocationDisplay(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
                },
                (err) => {
                    setLocationDisplay('Location access denied');
                    console.warn('ScanQR: Location error for display', err);
                }
            );
        }
    }, []);

    const checkGeoPermission = () => {
        if ('geolocation' in navigator) {
            navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
                setGeoPermission(result.state);
            });
        } else {
            setGeoPermission('denied');
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            setGettingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGettingLocation(false);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    setGettingLocation(false);
                    reject(new Error(`Location access denied: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const scannerRef = React.useRef(null);

    useEffect(() => {
        if (scanning) {
            console.log('Starting scanner initialization...');
            // Small timeout to ensure DOM element is rendered
            const timer = setTimeout(() => {
                const element = document.getElementById('reader-container');
                if (element && !scannerRef.current) {
                    try {
                        console.log('Mounting scanner to element');
                        const scanner = new Html5QrcodeScanner(
                            'reader-container',
                            {
                                fps: 10,
                                qrbox: { width: 250, height: 250 },
                                showTorchButtonIfSupported: true,
                                verbose: true // Enable verbose logging
                            },
                            false
                        );
                        scannerRef.current = scanner;
                        scanner.render(onScanSuccess, onScanError);
                    } catch (err) {
                        console.error("Failed to start scanner", err);
                        setError("Failed to start camera: " + err.message);
                        setScanning(false);
                    }
                } else {
                    console.warn('Scanner element not found or scanner already active');
                }
            }, 300);

            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    console.log('Cleaning up scanner');
                    try {
                        scannerRef.current.clear().catch(err => console.warn("Failed to clear scanner", err));
                    } catch (e) {
                        console.warn('Error clearing scanner', e);
                    }
                    scannerRef.current = null;
                }
            };
        }
    }, [scanning]);

    const startScanning = () => {
        setScanning(true);
        setError(null);
        setResult(null);
    };

    const onScanSuccess = async (decodedText, decodedResult) => {
        setScanning(false);
        // Scanner cleanup is handled by useEffect when scanning becomes false

        try {
            setLoading(true);
            setError(null);

            // Parse QR data
            let qrData;
            try {
                qrData = JSON.parse(decodedText);
            } catch (e) {
                // If not JSON, check if it's a valid Lecture ID (ObjectId is 24 chars)
                if (decodedText.length > 24) {
                    console.error("Invalid QR format: looks like raw token");
                    setError('❌ OLD QR DETECTED! Please ask the teacher to click "Regenerate QR" on their screen.');
                    setLoading(false);
                    return;
                }
                // Assume it's a plain lecture ID
                qrData = { lectureId: decodedText };
            }

            // Get current location for geo-fencing
            let location = null;
            try {
                setGettingLocation(true);
                location = await getCurrentLocation();
            } catch (locError) {
                // If backend requires geo-fencing, this will fail
                // Otherwise, backend will handle it
                console.warn('Location error:', locError.message);
            }

            // Get device fingerprint (simple version - can be enhanced)
            const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
            localStorage.setItem('deviceId', deviceId);

            // Call attendance marking API
            const response = await api.post('/attendance/mark', {
                lectureId: qrData.lectureId,
                qrToken: qrData.token,
                latitude: location?.latitude,
                longitude: location?.longitude,
                deviceId,
                timestamp: new Date().toISOString()
            });

            setResult({
                success: true,
                message: response.data.message || 'Attendance marked successfully! ✅',
                data: response.data
            });

            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
                navigate('/student/dashboard');
            }, 3000);

        } catch (error) {
            console.error('Error marking attendance:', error);
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to mark attendance',
                details: error.response?.data?.details || error.message
            });
        } finally {
            setLoading(false);
            setGettingLocation(false);
        }
    };

    const onScanError = (errorMessage) => {
        // Ignore scanning errors (happens continuously while scanning)
        // Only log critical errors
        if (errorMessage.includes('NotAllowedError')) {
            setError('Camera permission denied. Please allow camera access.');
            setScanning(false);
        }
    };

    const generateDeviceId = () => {
        // Simple device fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('fingerprint', 2, 2);
        const canvasData = canvas.toDataURL();

        const fingerprint = btoa(
            navigator.userAgent +
            navigator.language +
            new Date().getTimezoneOffset() +
            canvasData.substring(0, 50)
        );

        return fingerprint.substring(0, 32);
    };

    const resetScanner = () => {
        setScanning(false);
        setResult(null);
        setError(null);
        Html5QrcodeScanner.clear();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto">
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
                        <QrCode className="text-blue-600" size={36} />
                        Scan QR Code
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {subjectFromState ? (
                            <span>Scanning for: <strong className="text-blue-600">{subjectFromState}</strong></span>
                        ) : (
                            'Scan the QR code displayed by your teacher to mark attendance'
                        )}
                    </p>
                </div>

                {/* Location Permission Status */}
                {geoPermission && (
                    <div className={`mb-6 p-4 rounded-xl border ${geoPermission === 'granted'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            <MapPin className={
                                geoPermission === 'granted' ? 'text-green-600' : 'text-yellow-600'
                            } size={20} />
                            <div className="flex-1">
                                <p className={`font-medium ${geoPermission === 'granted' ? 'text-green-800' : 'text-yellow-800'
                                    }`}>
                                    Location Access: {geoPermission === 'granted' ? 'Enabled' : 'Required'}
                                </p>
                                {geoPermission !== 'granted' && (
                                    <p className="text-sm text-yellow-700 mt-1">
                                        If geo-fencing is enabled, you'll need to allow location access
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Scanner Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {!scanning && !result && !loading && (
                        <div className="text-center py-12">
                            <Camera className="mx-auto text-gray-400 mb-4" size={64} />
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                Ready to Scan
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Make sure the QR code is clearly visible on your teacher's screen
                            </p>
                            <button
                                onClick={startScanning}
                                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-3 mx-auto"
                            >
                                <QrCode size={24} />
                                Start Scanning
                            </button>

                            {/* Security Info */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-3">
                                    🔒 Active Security Checks
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>✓ Device binding verification</p>
                                    <p>✓ QR code expiry validation</p>
                                    <p>✓ Geo-location verification (if enabled)</p>
                                    <p>✓ Branch & year matching</p>
                                    <p>✓ Duplicate prevention</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QR Scanner */}
                    {scanning && (
                        <div>
                            <div id="reader-container" className="w-full bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px', border: '2px solid red' }}></div>
                            <button
                                onClick={resetScanner}
                                className="mt-4 w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Stop Scanning
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="text-center py-12">
                            <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {gettingLocation ? 'Getting your location...' : 'Marking attendance...'}
                            </h3>
                            <p className="text-gray-600">
                                Please wait while we verify your attendance
                            </p>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && !loading && (
                        <div className="text-center py-12">
                            {result.success ? (
                                <>
                                    <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
                                    <h3 className="text-2xl font-bold text-green-800 mb-2">
                                        Success!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {result.message}
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-left">
                                        <div className="grid grid-cols-2 gap-y-2">
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase">Subject</p>
                                                <p className="font-bold text-green-900">{result.data.attendance?.subject || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase">Time</p>
                                                <p className="font-bold text-green-900">{new Date(result.data.attendance?.markedAt).toLocaleTimeString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase">Student Name</p>
                                                <p className="font-bold text-green-900">{result.data.attendance?.studentName}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-xs uppercase">Roll No</p>
                                                <p className="font-bold text-green-900">{result.data.attendance?.rollNo}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-500 text-xs uppercase">Branch</p>
                                                <p className="font-bold text-green-900">{result.data.attendance?.branch}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <XCircle className="mx-auto text-red-600 mb-4" size={64} />
                                    <h3 className="text-2xl font-bold text-red-800 mb-2">
                                        Failed
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {result.message}
                                    </p>
                                    {result.details && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-left mb-6">
                                            <p className="text-red-800">
                                                <AlertTriangle size={16} className="inline mr-2" />
                                                {result.details}
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={resetScanner}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && !loading && (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto text-red-600 mb-4" size={64} />
                            <h3 className="text-xl font-bold text-red-800 mb-2">
                                Error
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {error}
                            </p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    checkGeoPermission();
                                }}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Important Instructions
                    </h3>
                    <ul className="text-sm text-blue-800 space-y-2">
                        <li>✓ Make sure you're in the classroom</li>
                        <li>✓ Allow camera and location permissions when prompted</li>
                        <li>✓ QR codes expire quickly - scan immediately when displayed</li>
                        <li>✓ Each student can only mark attendance once per lecture</li>
                        <li>✓ Your device and location will be verified for security</li>
                    </ul>
                </div>

                {/* System Status Debug */}
                <div className="mt-6 bg-gray-100 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin size={20} className="text-gray-600" />
                        System Status (Debug)
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span>Your IP:</span>
                            <span className="font-mono font-medium text-gray-800">{clientIp}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span>GPS Location:</span>
                            <span className="font-mono font-medium text-gray-800">{locationDisplay}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Device ID:</span>
                            <span className="font-mono font-medium text-gray-800 text-xs truncate max-w-[150px]">{localStorage.getItem('deviceId') || 'Not generated'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScanQR;
