import { useState } from "react";
import RoleSelector from "./RoleSelector";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

function AuthModal({ isOpen, setIsOpen }) {
  const [role, setRole] = useState("student");
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;
  console.log("AuthModal: Rendering");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-96 p-8 rounded-2xl shadow-xl relative animate-fadeIn">

        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        <RoleSelector role={role} setRole={setRole} />

        {isLogin ? (
          <LoginForm role={role} />
        ) : (
          <RegisterForm role={role} />
        )}

        {/* Toggle */}
        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 font-medium"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 font-medium"
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default AuthModal;
