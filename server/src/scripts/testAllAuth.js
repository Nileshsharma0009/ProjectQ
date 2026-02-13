
import fs from 'fs';

const testAllAuth = async () => {
    const baseUrl = 'http://localhost:5000/api';
    const results = [];

    const log = (msg) => {
        console.log(msg);
        results.push(msg);
    };

    log('=== AUTHENTICATION TESTS ===\n');

    // Seed
    log('[1/5] Seeding database...');
    const seedRes = await fetch(`${baseUrl}/auth/seed`, { method: 'POST' });
    const seedData = await seedRes.json();
    log(`${seedData.message}\n`);

    // Teacher Login
    log('[2/5] Teacher Login...');
    const teacherRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'teacher@example.com', password: 'password123' })
    });
    const teacherData = await teacherRes.json();
    if (teacherRes.ok) {
        log(`✓ SUCCESS: ${teacherData.name} (${teacherData.role})`);
        log(`  Token: ${teacherData.token.substring(0, 20)}...\n`);
    } else {
        log(`✗ FAILED: ${teacherData.message}\n`);
    }

    // Student Login
    log('[3/5] Student Login...');
    const studentRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
    });
    const studentData = await studentRes.json();
    if (studentRes.ok) {
        log(`✓ SUCCESS: ${studentData.name} (${studentData.role})`);
        log(`  Token: ${studentData.token.substring(0, 20)}...\n`);
    } else {
        log(`✗ FAILED: ${studentData.message}\n`);
    }

    // New Student Registration
    log('[4/5] Student Registration (with rollNo, branch, year)...');
    const regStudentRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'New Student',
            email: `newstudent${Date.now()}@test.com`,
            password: 'test123',
            role: 'student',
            rollNo: `${Date.now()}`,
            department: 'ECE',
            year: '2nd Year'
        })
    });
    const regStudentData = await regStudentRes.json();
    if (regStudentRes.ok) {
        log(`✓ SUCCESS: ${regStudentData.name}`);
        log(`  Email: ${regStudentData.email}`);
        log(`  Token: ${regStudentData.token.substring(0, 20)}...\n`);
    } else {
        log(`✗ FAILED: ${regStudentData.message}\n`);
    }

    // New Teacher Registration
    log('[5/5] Teacher Registration...');
    const regTeacherRes = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'New Teacher',
            email: `newteacher${Date.now()}@test.com`,
            password: 'test123',
            role: 'teacher'
        })
    });
    const regTeacherData = await regTeacherRes.json();
    if (regTeacherRes.ok) {
        log(`✓ SUCCESS: ${regTeacherData.name}`);
        log(`  Email: ${regTeacherData.email}`);
        log(`  Token: ${regTeacherData.token.substring(0, 20)}...\n`);
    } else {
        log(`✗ FAILED: ${regTeacherData.message}\n`);
    }

    log('=== ALL TESTS COMPLETE ===');

    fs.writeFileSync('test-results.txt', results.join('\n'));
};

testAllAuth().catch(console.error);
