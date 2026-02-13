
const testLogin = async () => {
    try {
        console.log("Testing seed endpoint...");
        const seedResponse = await fetch('http://localhost:5000/api/auth/seed', { method: 'POST' });
        const seedData = await seedResponse.json();
        console.log("Seed result:", seedData);

        console.log("\nAttempting login for admin...");
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✓ Login Success!");
            console.log("Token:", data.token ? "Received" : "Missing");
            console.log("Role:", data.role);
            console.log("User:", data.name);
        } else {
            console.error("✗ Login Failed!");
            console.error("Status:", response.status);
            console.error("Data:", data);
        }

    } catch (error) {
        console.error("Network Error:", error.message);
    }
};

testLogin();
