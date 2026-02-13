import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function RegisterForm({ role }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Student specific fields
  const [rollNo, setRollNo] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");

  const branches = ["CSE", "ECE", "ME", "CE", "IT"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Clear form when role changes
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setRollNo("");
    setBranch("");
    setYear("");
  }, [role]);

  const handleSubmit = async () => {
    // Pass new fields to register function
    await register(name, email, password, role || "student", rollNo, branch, year);
    // Optional: Clear form on success handled by parent or navigation
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-4 p-3 border rounded-lg"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-3 border rounded-lg"
      />

      {/* Student Specific Fields */}
      {role === 'student' && (
        <>
          <input
            type="text"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            className="w-full mb-4 p-3 border rounded-lg"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-6 p-3 border rounded-lg"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
      >
        Register as {role || "Student"}
      </button>
    </div>
  );
}

export default RegisterForm;
