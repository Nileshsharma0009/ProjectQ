import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password, role) => {
    try {
      // Use the centralized api instance
      const response = await api.post('/auth/login', { email, password });
      const data = response.data; // axios response has data field

      if (data.role !== role) {
        alert("Role mismatch! Please login with the correct role.");
        return;
      }
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      if (data.role === "student") navigate("/student/dashboard");
      if (data.role === "teacher") navigate("/teacher/dashboard");
      if (data.role === "admin") navigate("/admin/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      // specific error message from backend
      const message = error.response?.data?.message || error.message || "Login failed";
      alert(`Login Error: ${message}`);
    }
  };

  const register = async (name, email, password, role, rollNo, branch, year) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role, rollNo, department: branch, year });
      const data = response.data;

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      if (data.role === "student") navigate("/student/dashboard");
      if (data.role === "teacher") navigate("/teacher/dashboard");
      if (data.role === "admin") navigate("/admin/dashboard");

    } catch (error) {
      console.error("Register error:", error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
