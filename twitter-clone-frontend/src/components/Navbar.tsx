import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4 mb-8">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link
            to="/home"
            className="text-blue-600 font-bold hover:text-blue-800"
          >
            Home
          </Link>
          <Link
            to="/explore"
            className="text-blue-600 font-bold hover:text-blue-800"
          >
            Explore
          </Link>
          {user && (
            <Link
              to={`/profile/${user.username}`}
              className="text-blue-600 font-bold hover:text-blue-800"
            >
              Profile
            </Link>
          )}
        </div>
        <div>
          {user && (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-1 px-3 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
