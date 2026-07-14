import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import AdminRoute from "../components/admin/AdminRoute";
import AdminLayout from "../pages/layout/AdminLayout";

// Áp dụng Lazy Loading cho các trang Admin
const AdminDashboard = lazy(
  () => import("../pages/admin/dashboard/AdminDashboard"),
);
const UserStats = lazy(() => import("../pages/admin/dashboard/UserStats"));
const PostStats = lazy(() => import("../pages/admin/dashboard/PostStats"));
const StoryStats = lazy(() => import("../pages/admin/dashboard/StoryStats"));
const MessageStats = lazy(
  () => import("../pages/admin/dashboard/MessageStats"),
);
const ReportStats = lazy(() => import("../pages/admin/dashboard/ReportStats"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const PostManagement = lazy(() => import("../pages/admin/PostManagement"));
const MessageManagement = lazy(
  () => import("../pages/admin/MessageManagement"),
);
const ReportPostManagement = lazy(
  () => import("../pages/admin/ReportPostManagement"),
);
const AppealManagement = lazy(() => import("../pages/admin/AppealManagement"));
const FeedbackManagement = lazy(
  () => import("../pages/admin/FeedbackManagement"),
);

const AdminRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-gray-500 font-medium">
          Đang tải trang quản trị...
        </div>
      }
    >
      <Routes>
        {/* Route Guard bảo vệ các route con */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="messages" element={<MessageManagement />} />
            <Route path="appeals" element={<AppealManagement />} />
            <Route path="feedbacks" element={<FeedbackManagement />} />
            <Route path="dashboard/users" element={<UserStats />} />
            <Route path="dashboard/posts" element={<PostStats />} />
            <Route path="dashboard/stories" element={<StoryStats />} />
            <Route path="dashboard/messages" element={<MessageStats />} />
            <Route path="dashboard/reports" element={<ReportStats />} />
            <Route path="reports/posts" element={<ReportPostManagement />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
