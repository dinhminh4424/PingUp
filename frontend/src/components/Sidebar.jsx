import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { LogOut, PlusCircle, User, User2Icon, Shield } from "lucide-react";

import { logout } from "../services/AuthServices";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  // const user = dummyUserData;

  const { logout: logoutAuth, userCurrent: user } = useAuth();

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
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          <div
            onClick={() => {
              console.log("Model");
            }}
            className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"
          >
            {user.profile_picture ? (
              <img src={user.profile_picture} alt="" className="rounded-full" />
            ) : (
              <img src="/default-avatar.avif" alt="" className="rounded-full" />
            )}
          </div>

          <div>
            <h1 className="text-sm font-medium">{user.full_name}</h1>
            <p className="text-xs text-gray-500">@{user.username}</p>
          </div>
        </div>
        <LogOut
          onClick={() => {
            handleLogout();
          }}
          className="w-4.5 text-gray-400 hover:text-gray-700  transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
