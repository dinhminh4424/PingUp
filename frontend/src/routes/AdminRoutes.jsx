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
const UserDetail = lazy(() => import("../pages/admin/UserDetail"));
const PostManagement = lazy(() => import("../pages/admin/PostManagement"));
const MessageManagement = lazy(
  () => import("../pages/admin/MessageManagement"),
);
const ReportPostManagement = lazy(
  () => import("../pages/admin/ReportPostManagement"),
);
const ReportCommentManagement = lazy(
  () => import("../pages/admin/ReportCommentManagement"),
);
const ReportConversationManagement = lazy(
  () => import("../pages/admin/ReportConversationManagement"),
);

const ReportUserManagement = lazy(
  () => import("../pages/admin/ReportUserManagement"),
);
const AppealManagement = lazy(() => import("../pages/admin/AppealManagement"));
const FeedbackManagement = lazy(
  () => import("../pages/admin/FeedbackManagement"),
);

const NotificationTemplates = lazy(
  () => import("../pages/admin/notifications/NotificationTemplates"),
);
const CreateNotification = lazy(
  () => import("../pages/admin/notifications/CreateNotification"),
);
const NotificationHistory = lazy(
  () => import("../pages/admin/notifications/NotificationHistory"),
);

const AdCampaigns = lazy(() => import("../pages/admin/ads/AdCampaigns"));
const AdReview = lazy(() => import("../pages/admin/ads/AdReview"));
const AdRevenue = lazy(() => import("../pages/admin/ads/AdRevenue"));
const AdLeads = lazy(() => import("../pages/admin/ads/AdLeads"));
const AdLeadsDetails = lazy(() => import("../pages/admin/ads/AdLeadsDetails"));


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
            <Route path="users/:id" element={<UserDetail />} />
            <Route path="posts" element={<PostManagement />} />
            <Route path="messages" element={<MessageManagement />} />
            <Route path="appeals" element={<AppealManagement />} />
            <Route path="feedbacks" element={<FeedbackManagement />} />
            <Route path="notifications/templates" element={<NotificationTemplates />} />
            <Route path="notifications/create" element={<CreateNotification />} />
            <Route path="notifications/history" element={<NotificationHistory />} />
            <Route path="dashboard/users" element={<UserStats />} />
            <Route path="dashboard/posts" element={<PostStats />} />
            <Route path="dashboard/stories" element={<StoryStats />} />
            <Route path="dashboard/messages" element={<MessageStats />} />
            <Route path="dashboard/reports" element={<ReportStats />} />
            <Route path="reports/posts" element={<ReportPostManagement />} />
            <Route
              path="reports/comments"
              element={<ReportCommentManagement />}
            />
            <Route
              path="reports/conversations"
              element={<ReportConversationManagement />}
            />
            <Route
              path="reports/messages"
              element={<ReportConversationManagement />}
            />
            <Route path="reports/users" element={<ReportUserManagement />} />
            
            {/* Quảng cáo */}
            <Route path="ads/campaigns" element={<AdCampaigns />} />
            <Route path="ads/review" element={<AdReview />} />
            <Route path="ads/revenue" element={<AdRevenue />} />
            <Route path="ads/leads" element={<AdLeads />} />
            <Route path="ads/leads/:id" element={<AdLeadsDetails />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
