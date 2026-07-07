// frontend/src/pages/layout/AdminLayout.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="w-full flex h-screen bg-slate-100">
      {/* Admin Sidebar đơn giản */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-5 space-y-4">
        <h2 className="text-xl font-bold text-indigo-400">PingUp Admin</h2>
        <nav className="flex flex-col space-y-2">
          <Link to="/admin" className="p-2 hover:bg-slate-800 rounded">
            Dashboard
          </Link>
          <Link to="/admin/users" className="p-2 hover:bg-slate-800 rounded">
            Quản lý User
          </Link>
          <Link to="/" className="p-2 hover:bg-slate-800 text-gray-400 rounded">
            Quay lại Client
          </Link>
        </nav>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
