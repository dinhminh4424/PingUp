import React, { useState } from "react";
import Sidebar from "../../components/sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../../assets/assets";
import Loading from "../../components/Loading";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = dummyUserData;

  return user ? (
    <div className="w-full flex h-screen">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {/* Main content */}
      <div className="flex flex-1  bg-slate-50 overflow-y-auto">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
      {/* Toggle button (mobile) */}
      {sidebarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default UserLayout;
