import React, { useState, useRef, useEffect } from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { LogOut, PlusCircle, User, User2Icon, Shield, ChevronsUpDown, Settings, Sparkles, MessageSquare, ShieldAlert } from "lucide-react";

import { logout } from "../services/AuthServices";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { logout: logoutAuth, userCurrent: user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (!res.success) {
        console.log("Lỗi đăng xuất: ");
      }

      await logoutAuth();

      window.location.href = "/";
    } catch (error) {
      console.log("Lỗi đăng xuất: ", error);
    }
  };

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? "translate-x-0 " : "max-sm:-translate-x-full"} transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        <img
          onClick={() => navigate("/")}
          src={assets.logo}
          className="w-26 ml-7 my-2 cursor-pointer"
          alt=""
        />
        <hr className="border-gray-300 mb-8" />
        <MenuItems setSidebarOpen={setSidebarOpen} />
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700  hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Create Post
        </Link>
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center justify-center gap-2 py-2.5 mt-3 mx-6 rounded-lg bg-gray-900 hover:bg-gray-800 active:scale-95 transition text-white cursor-pointer text-sm font-medium"
          >
            <Shield className="w-4.5 h-4.5 text-indigo-400" />
            Admin Panel
          </Link>
        )}
      </div>
      <div ref={menuRef} className="relative w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex gap-2 items-center cursor-pointer flex-1 min-w-0"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <img src="/default-avatar.avif" alt="" className="w-full h-full object-cover rounded-full" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-medium truncate">{user.full_name}</h1>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </div>
        
        <ChevronsUpDown
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-4 h-4 text-gray-400 hover:text-gray-700 transition cursor-pointer flex-shrink-0 ml-2"
        />

        {menuOpen && (
          <div className="absolute bottom-16 left-6 right-6 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Header info */}
            <div className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-50">
                <img
                  src={user.profile_picture || "/default-avatar.avif"}
                  alt=""
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</h4>
                <p className="text-xs text-gray-500 truncate">{user.email || `@${user.username}`}</p>
              </div>
            </div>
            
            <hr className="border-gray-100 my-1" />
            
            {/* Navigation links */}
            <button
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition w-full text-left text-sm font-medium text-gray-700"
            >
              <Sparkles className="w-4 h-4 text-gray-500" />
              <span>Back to Home</span>
            </button>
            
            <button
              onClick={() => {
                navigate("/settings");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition w-full text-left text-sm font-medium text-gray-700"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                navigate("/feedback");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition w-full text-left text-sm font-medium text-gray-700"
            >
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span>Feedback</span>
            </button>

            <button
              onClick={() => {
                navigate("/appeal");
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition w-full text-left text-sm font-medium text-gray-700"
            >
              <ShieldAlert className="w-4 h-4 text-gray-500" />
              <span>Appeal</span>
            </button>
            
            <hr className="border-gray-100 my-1" />
            
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition w-full text-left text-sm font-medium"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
