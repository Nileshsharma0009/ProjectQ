
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root (two levels up from src/scripts)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isApproved: true,
        rollNo: undefined,
        department: undefined,
        year: undefined
    },
    {
        name: 'Teacher User',
        email: 'teacher@example.com',
        password: 'password123',
        role: 'teacher',
        isApproved: true,
        rollNo: undefined,
        department: undefined,
        year: undefined
    },
    {
        name: 'Student User',
        email: 'student@example.com',
        password: 'password123',
        role: 'student',
        isApproved: true,
        rollNo: '123456',
        department: 'CSE',
        year: '3rd Year'
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing users to avoid duplicates
        await User.deleteMany({});
        console.log('Cleared existing users');

        for (const user of users) {
            await User.create(user);
            console.log(`Created user: ${user.name} (${user.role})`);
        }

        console.log('Seeding completed');
        process.exit();
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
