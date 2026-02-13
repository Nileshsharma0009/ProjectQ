import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar({ onOpenAuth }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-semibold text-blue-600"
          >
            QR-Attend
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 items-center text-slate-600 font-medium">
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#how" className="hover:text-blue-600 transition">
              How It Works
            </a>
            <button
              onClick={onOpenAuth}
              className="hover:text-blue-600 transition"
            >
              Login
            </button>

            <button
              onClick={onOpenAuth}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t shadow-sm">
            <div className="flex flex-col px-6 py-4 gap-4 text-slate-700 font-medium">

              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                Home
              </Link>

              <a
                href="#features"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                Features
              </a>

              <a
                href="#how"
                onClick={() => setIsOpen(false)}
                className="hover:text-blue-600"
              >
                How It Works
              </a>

              <button
                onClick={() => {
                  onOpenAuth();
                  setIsOpen(false);
                }}
                className="text-left hover:text-blue-600"
              >
                Login
              </button>

              <button
                onClick={() => {
                  onOpenAuth();
                  setIsOpen(false);
                }}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg text-center hover:bg-blue-700 transition"
              >
                Get Started
              </button>


            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
