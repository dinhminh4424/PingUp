import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/AdminRoute";
import AdminLayout from "../pages/layout/AdminLayout";

// Áp dụng Lazy Loading cho các trang Admin
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));

const AdminRoutes = () => {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500 font-medium">Đang tải trang quản trị...</div>}>
      <Routes>
        {/* Route Guard bảo vệ các route con */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            {/* Thêm các route admin con khác ở đây trong tương lai */}
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
