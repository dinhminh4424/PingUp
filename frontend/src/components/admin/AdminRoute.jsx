// frontend/src/components/admin/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

const AdminRoute = () => {
  const { userCurrent, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-gray-500 font-medium">Đang xác thực quyền Admin...</div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không phải admin -> thông báo lỗi và chuyển hướng về trang chủ
  if (!userCurrent || userCurrent.role !== "admin") {
    console.log("Không phải admin ", userCurrent);
    toast.error("Bạn không có quyền truy cập vào khu vực quản trị!");
    return <Navigate to="/" replace />;
  }

  // Nếu là admin -> cho phép render các route con (Outlet)
  return <Outlet />;
};

export default AdminRoute;
