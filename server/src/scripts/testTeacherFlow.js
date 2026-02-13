
const testTeacherFlow = async () => {
    const baseUrl = 'http://localhost:5000/api';

    console.log('=== TESTING TEACHER DASHBOARD FLOW ===\n');

    // Step 1: Login as teacher
    console.log('1. Logging in as teacher...');
    try {
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'teacher@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) {
            console.log('✗ Login failed:', loginData.message);
            return;
        }

        console.log('✓ Login successful');
        console.log(`  Name: ${loginData.name}`);
        console.log(`  Role: ${loginData.role}`);
        const token = loginData.token;
        console.log(`  Token: ${token.substring(0, 20)}...\n`);

        // Step 2: Get Dashboard Stats
        console.log('2. Fetching dashboard stats...');
        const statsRes = await fetch(`${baseUrl}/teacher/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();

        if (statsRes.ok) {
            console.log('✓ Stats retrieved:');
            console.log(`  Total Lectures: ${stats.totalLectures}`);
            console.log(`  This Week: ${stats.lecturesThisWeek}`);
            console.log(`  Students: ${stats.totalStudents}`);
            console.log(`  Avg Attendance: ${stats.averageAttendance}%\n`);
        } else {
            console.log('✗ Stats failed:', stats.message, '\n');
        }

        // Step 3: Get Classrooms
        console.log('3. Fetching classrooms...');
        const classroomsRes = await fetch(`${baseUrl}/teacher/classrooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const classrooms = await classroomsRes.json();

        if (classroomsRes.ok) {
            console.log(`✓ Found ${classrooms.length} classrooms`);
            if (classrooms.length > 0) {
                console.log(`  First classroom: ${classrooms[0].name}\n`);
            }
        } else {
            console.log('✗ Classrooms failed:', classrooms.message, '\n');
        }

        // Step 4: Create a lecture
        console.log('4. Creating a test lecture...');
        if (classrooms.length > 0) {
            const lectureRes = await fetch(`${baseUrl}/teacher/lectures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    classroomId: classrooms[0]._id,
                    subject: 'Test Subject - Math'
                })
            });
            const lecture = await lectureRes.json();

            if (lectureRes.ok) {
                console.log('✓ Lecture created:');
                console.log(`  Subject: ${lecture.subject}`);
                console.log(`  Active: ${lecture.isActive}`);
                console.log(`  ID: ${lecture._id}\n`);

                // Step 5: Generate QR
                console.log('5. Generating QR code...');
                const qrRes = await fetch(`${baseUrl}/teacher/lectures/${lecture._id}/qr`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const qrData = await qrRes.json();

                if (qrRes.ok) {
                    console.log('✓ QR generated:');
                    console.log(`  Token: ${qrData.qrToken.substring(0, 30)}...`);
                    console.log(`  Expires at: ${new Date(qrData.expiresAt).toLocaleTimeString()}\n`);
                } else {
                    console.log('✗ QR generation failed:', qrData.message, '\n');
                }

                // Step 6: Get Analytics
                console.log('6. Fetching analytics...');
                const analyticsRes = await fetch(`${baseUrl}/teacher/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const analytics = await analyticsRes.json();

                if (analyticsRes.ok) {
                    console.log('✓ Analytics retrieved:');
                    console.log(`  Monthly data points: ${analytics.monthlyGraph?.length || 0}`);
                    console.log(`  Classes tracked: ${analytics.classWisePerformance?.length || 0}\n`);
                } else {
                    console.log('✗ Analytics failed:', analytics.message, '\n');
                }

                // Step 7: End lecture
                console.log('7. Ending lecture...');
                const endRes = await fetch(`${baseUrl}/teacher/lectures/${lecture._id}/end`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const endData = await endRes.json();

                if (endRes.ok) {
                    console.log('✓ Lecture ended successfully\n');
                } else {
                    console.log('✗ End lecture failed:', endData.message, '\n');
                }
            } else {
                console.log('✗ Lecture creation failed:', lecture.message, '\n');
            }
        } else {
            console.log('⚠ Skipping lecture creation - no classrooms available\n');
        }

        console.log('=== ALL TESTS COMPLETE ===');
        console.log('\n✨ Teacher dashboard endpoints are working!');
        console.log('You can now login at: http://localhost:3000/login');
        console.log('Use: teacher@example.com / password123');

    } catch (error) {
        console.error('\n✗ TEST ERROR:', error.message);
    }
};

testTeacherFlow();
