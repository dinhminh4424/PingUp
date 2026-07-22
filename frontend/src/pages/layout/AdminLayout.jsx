import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const AdminLayout = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const getBreadcrumbLabel = (path, segment) => {
    const routeLabels = {
      "/admin": "Quản trị",
      "/admin/users": "Quản lý người dùng",
      "/admin/dashboard": "Tổng quan",
      "/admin/dashboard/users": "Thống kê người dùng",
      "/admin/dashboard/posts": "Thống kê bài viết",
      "/admin/ads": "Quảng cáo",
      "/admin/ads/campaigns": "Chiến dịch quảng cáo",
      "/admin/ads/review": "Phê duyệt quảng cáo",
      "/admin/ads/revenue": "Doanh thu quảng cáo",
      "/admin/ads/leads": "Khách hàng đăng ký (Leads)",
      "/admin/reports": "Báo cáo vi phạm",
      "/admin/reports/posts": "Báo cáo bài viết",
      "/admin/reports/comments": "Báo cáo bình luận",
      "/admin/reports/messages": "Báo cáo hộp thoại",
      "/admin/reports/users": "Báo cáo người dùng",
      "/admin/notifications": "Thông báo hệ thống",
      "/admin/notifications/templates": "Template thông báo",
      "/admin/notifications/create": "Tạo thông báo",
      "/admin/notifications/history": "Lịch sử gửi",
    };

    if (routeLabels[path]) {
      return routeLabels[path];
    }

    const segmentLabels = {
      admin: "Quản trị",
      users: "Người dùng",
      ads: "Quảng cáo",
      campaigns: "Chiến dịch",
      review: "Phê duyệt",
      revenue: "Doanh thu",
      reports: "Báo cáo vi phạm",
      notifications: "Thông báo hệ thống",
      posts: "Bài viết",
      comments: "Bình luận",
      messages: "Hộp thoại",
      dashboard: "Dashboard",
    };

    return segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join("/")}`;
                  const isLast = index === pathnames.length - 1;
                  const label = getBreadcrumbLabel(to, value);

                  return (
                    <React.Fragment key={to}>
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink render={<Link to={to} />}>
                            {label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
