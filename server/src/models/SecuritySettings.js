import mongoose from 'mongoose';

const securitySettingsSchema = new mongoose.Schema({
    geoFencingEnabled: {
        type: Boolean,
        default: true
    },
    deviceBindingEnabled: {
        type: Boolean,
        default: true
    },
    ipBindingEnabled: {
        type: Boolean,
        default: false  // Can be toggled by admin
    },
    qrExpiryEnabled: {
        type: Boolean,
        default: true
    },
    qrExpirySeconds: {
        type: Number,
        default: 30  // 30 seconds
    },
    geoFenceRadius: {
        type: Number,
        default: 50  // meters
    }
}, { timestamps: true });

// Ensure only one settings document exists
securitySettingsSchema.index({}, { unique: true });

export default mongoose.model('SecuritySettings', securitySettingsSchema);
