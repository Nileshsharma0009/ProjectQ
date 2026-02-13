import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role, rollNo, department, year } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Additional validation for students could go here

        const user = await User.create({
            name,
            email,
            password,
            role,
            rollNo: role === 'student' ? rollNo : undefined,
            department: role === 'student' ? department : undefined,
            year: role === 'student' ? year : undefined
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            // Base response
            const response = {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                token: generateToken(user._id)
            };

            // Add student-specific fields
            if (user.role === 'student') {
                response.rollNo = user.rollNo;
                response.branch = user.branch || user.department;
                response.department = user.department;
                response.year = user.year;
                response.section = user.profile?.section;
                response.deviceId = user.deviceId;
                response.ipAddress = user.ipAddress;
            }

            res.json(response);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Temporary Seed Function
export const seedUsers = async (req, res) => {
    try {
        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin',
                isApproved: true,
                rollNo: undefined
            },
            {
                name: 'Teacher User',
                email: 'teacher@example.com',
                password: 'password123',
                role: 'teacher',
                isApproved: true,
                rollNo: undefined
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

        await User.deleteMany({}); // Clear existing

        for (const user of users) {
            await User.create(user);
        }

        res.json({ message: 'Users seeded successfully', users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
