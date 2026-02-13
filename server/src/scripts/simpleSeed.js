// Simple seed script - Run from server directory
// node src/scripts/simpleSeed.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function seedUsers() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected!\n');

        console.log('🗑️  Clearing existing users...');
        await User.deleteMany({});
        console.log('✅ Cleared!\n');

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
                isApproved: true
            },
            {
                name: 'Teacher User',
                email: 'teacher@example.com',
                password: 'password123',
                role: 'teacher',
                isApproved: true
            },
            {
                name: 'Student User',
                email: 'student@example.com',
                password: 'password123',
                role: 'student',
                isApproved: true,
                rollNo: '123456',
                department: 'CSE',
                branch: 'CSE',
                year: '3rd Year',
                profile: {
                    department: 'CSE',
                    branch: 'CSE',
                    year: '3rd Year',
                    section: 'A'
                }
            }
        ];

        console.log('👥 Creating users...');
        for (const userData of users) {
            const user = await User.create(userData);
            console.log(`✅ Created: ${user.name} (${user.email}) - Role: ${user.role}`);
        }

        console.log('\n🎉 Seeding complete!');
        console.log('\n📋 Test Credentials:');
        console.log('Admin:   admin@example.com / password123');
        console.log('Teacher: teacher@example.com / password123');
        console.log('Student: student@example.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedUsers();
