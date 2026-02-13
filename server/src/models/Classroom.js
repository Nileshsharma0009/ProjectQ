import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false  // Only required for virtual classrooms
    },
    capacity: {
        type: Number,
        default: 50
    },
    isVirtual: {
        type: Boolean,
        default: false  // Virtual classrooms don't need geofencing
    },
    // Geofencing Coordinates (optional for virtual classrooms)
    latitude: {
        type: Number,
        required: function () {
            return !this.isVirtual;  // Required only for physical classrooms
        }
    },
    longitude: {
        type: Number,
        required: function () {
            return !this.isVirtual;  // Required only for physical classrooms
        }
    },
    radius: {
        type: Number, // in meters
        default: 50 // default 50 meters
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model('Classroom', classroomSchema);
