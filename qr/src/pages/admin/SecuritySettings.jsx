import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield,
    MapPin,
    Smartphone,
    Wifi,
    Clock,
    Save,
    AlertTriangle,
    CheckCircle,
    Settings
} from 'lucide-react';

import api from '../../services/api';

const SecuritySettings = () => {
    const [settings, setSettings] = useState({
        geoFencingEnabled: true,
        deviceBindingEnabled: true,
        ipBindingEnabled: false,
        qrExpiryEnabled: true,
        qrExpirySeconds: 30,
        geoFenceRadius: 50
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await api.get('/admin/security-settings');
            if (res.data) {
                setSettings(res.data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await api.put('/admin/security-settings', settings);
            setMessage('✅ Security settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('❌ Failed to save settings');
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const securityLayers = [
        {
            id: 'deviceBindingEnabled',
            icon: Smartphone,
            title: 'Device Binding',
            description: 'Prevent credential sharing by binding account to first device used',
            risk: 'HIGH',
            color: 'red',
            edgeCases: [
                '✓ Stops students from sharing login credentials',
                '✓ Each student can only use their own device',
                '✓ Admin can reset if student changes phone'
            ]
        },
        {
            id: 'geoFencingEnabled',
            icon: MapPin,
            title: 'Geo-Fencing',
            description: 'Ensure students are physically present in classroom',
            risk: 'HIGH',
            color: 'red',
            edgeCases: [
                '✓ Prevents marking from canteen/home',
                '✓ Validates GPS coordinates',
                '✓ Configurable radius per classroom'
            ]
        },
        {
            id: 'qrExpiryEnabled',
            icon: Clock,
            title: 'QR Code Expiry',
            description: 'QR code becomes invalid after set duration',
            risk: 'CRITICAL',
            color: 'purple',
            edgeCases: [
                '✓ Prevents screenshot sharing',
                '✓ Short expiry (30 seconds recommended)',
                '✓ Forces real-time scanning'
            ]
        },
        {
            id: 'ipBindingEnabled',
            icon: Wifi,
            title: 'IP Address Binding',
            description: 'Bind student to first IP address (not recommended for mobile)',
            risk: 'MEDIUM',
            color: 'yellow',
            edgeCases: [
                '⚠️ Can cause issues with mobile data',
                '⚠️ Students switching WiFi will be blocked',
                '✓ Good for computer lab scenarios only'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Shield className="text-blue-600" size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Security Settings</h1>
                            <p className="text-gray-600">Configure anti-proxy security layers for attendance system</p>
                        </div>
                    </div>
                </div>

                {/* Warning Alert */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="font-semibold text-yellow-800">Production Warning</h3>
                            <p className="text-sm text-yellow-700">
                                These settings affect all students. Disabling security features makes the system vulnerable to proxy attendance.
                                For production, keep at least Device Binding, Geo-Fencing, and QR Expiry enabled.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security Layers */}
                <div className="grid gap-6 mb-6">
                    {securityLayers.map((layer) => {
                        const Icon = layer.icon;
                        const isEnabled = settings[layer.id];

                        return (
                            <div key={layer.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-3 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            <Icon className={isEnabled ? 'text-green-600' : 'text-gray-400'} size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{layer.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${layer.color === 'red' ? 'bg-red-100 text-red-700' :
                                                    layer.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    RISK: {layer.risk}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{layer.description}</p>
                                            <div className="space-y-1">
                                                {layer.edgeCases.map((edgeCase, idx) => (
                                                    <p key={idx} className="text-sm text-gray-500">{edgeCase}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggle(layer.id)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                    >
                                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>

                                {/* Additional Settings */}
                                {layer.id === 'qrExpiryEnabled' && isEnabled && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            QR Expiry Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.qrExpirySeconds}
                                            onChange={(e) => handleChange('qrExpirySeconds', parseInt(e.target.value))}
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="10"
                                            max="300"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Recommended: 30 seconds for balance between usability and security
                                        </p>
                                    </div>
                                )}

                                {layer.id === 'geoFencingEnabled' && isEnabled && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Geo-Fence Radius (meters)
                                        </label>
                                        <input
                                            type="number"
                                            value={settings.geoFenceRadius}
                                            onChange={(e) => handleChange('geoFenceRadius', parseInt(e.target.value))}
                                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            min="10"
                                            max="200"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Recommended: 50 meters (covers classroom + nearby areas)
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Always-On Features */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={20} />
                        Always-On Security Layers
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                        <div>✅ JWT Authentication</div>
                        <div>✅ Role-Based Access Control</div>
                        <div>✅ Student Approval Required</div>
                        <div>✅ Branch/Year Validation</div>
                        <div>✅ Duplicate Prevention (DB Index)</div>
                        <div>✅ Lecture Time Validation</div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {message && (
                        <p className={`font-medium ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="ml-auto flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Security Settings'}
                    </button>
                </div>

                {/* Security Summary */}
                <div className="mt-6 bg-gray-800 text-white rounded-xl p-6">
                    <h3 className="font-bold mb-3">🔒 Current Security Level</h3>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-gray-400">Device Binding</div>
                            <div className={`font-bold ${settings.deviceBindingEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                {settings.deviceBindingEnabled ? 'ACTIVE' : 'DISABLED'}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">Geo-Fencing</div>
                            <div className={`font-bold ${settings.geoFencingEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                {settings.geoFencingEnabled ? 'ACTIVE' : 'DISABLED'}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">QR Expiry</div>
                            <div className={`font-bold ${settings.qrExpiryEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                {settings.qrExpiryEnabled ? `${settings.qrExpirySeconds}s` : 'DISABLED'}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400">IP Binding</div>
                            <div className={`font-bold ${settings.ipBindingEnabled ? 'text-yellow-400' : 'text-gray-400'}`}>
                                {settings.ipBindingEnabled ? 'ACTIVE' : 'DISABLED'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
