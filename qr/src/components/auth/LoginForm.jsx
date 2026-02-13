import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function LoginForm({ role }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission if wrapped in a form
    login(email, password, role);
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-3 border rounded-lg"
      />
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
        Login as {role}
      </button>
    </div>
  );
}

export default LoginForm;
