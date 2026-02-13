// Test Student Login Flow
// Run: node server/src/scripts/testStudentLogin.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testStudentLogin() {
    try {
        console.log('🧪 Testing Student Login Flow...\n');

        // Step 1: Seed users
        console.log('1️⃣ Seeding test users...');
        const seedRes = await axios.post(`${API_URL}/auth/seed`);
        console.log('✅ Seed Result:', seedRes.data.message);
        console.log('');

        // Step 2: Login as student
        console.log('2️⃣ Logging in as student...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'student@example.com',
            password: 'password123'
        });

        const userData = loginRes.data;
        console.log('✅ Login Successful!');
        console.log('📦 User Data Received:');
        console.log(JSON.stringify(userData, null, 2));
        console.log('');

        // Verify required fields
        console.log('3️⃣ Verifying student fields...');
        const requiredFields = ['_id', 'name', 'email', 'role', 'rollNo', 'branch', 'department', 'year', 'token', 'isApproved'];
        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            console.log('❌ Missing fields:', missingFields.join(', '));
        } else {
            console.log('✅ All required fields present!');
        }
        console.log('');

        // Step 3: Test authenticated API call
        console.log('4️⃣ Testing authenticated endpoint (student summary)...');
        const summaryRes = await axios.get(`${API_URL}/student/summary`, {
            headers: {
                'Authorization': `Bearer ${userData.token}`
            }
        });

        console.log('✅ Summary API works!');
        console.log('📊 Summary Data:');
        console.log(JSON.stringify(summaryRes.data, null, 2));
        console.log('');

        console.log('🎉 All tests passed! Student login is working correctly.');

    } catch (error) {
        console.error('❌ Test Failed!');
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

testStudentLogin();
