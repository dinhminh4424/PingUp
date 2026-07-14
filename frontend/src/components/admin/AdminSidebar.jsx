import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "@/components/nav-user";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Megaphone,
  Settings,
  Bell,
  History,
  ChevronRight,
  Terminal,
  FileText,
  MessageSquare,
} from "lucide-react";

const AdminSidebar = ({ ...props }) => {
  const location = useLocation();

  // Menu items list
  const navItems = [
    {
      title: "Dashboard",
      url: "#",
      icon: <LayoutDashboard className="size-4" />,
      isActive:
        location.pathname === "/admin" ||
        location.pathname.startsWith("/admin/dashboard"),
      items: [
        { title: "Tổng quan", url: "/admin", badge: "" },
        { title: "Người dùng", url: "/admin/dashboard/users", badge: "" },
        { title: "Bài viết", url: "/admin/dashboard/posts", badge: "" },
        { title: "Story", url: "/admin/dashboard/stories", badge: "" },
        { title: "Tin nhắn", url: "/admin/dashboard/messages", badge: "" },
        {
          title: "Báo cáo vi phạm",
          url: "/admin/dashboard/reports",
          badge: "",
        },
      ],
    },
    {
      title: "Quản lý người dùng",
      url: "/admin/users",
      icon: <Users className="size-4" />,
      isActive: location.pathname === "/admin/users",
      // badge: "128", // Example quantity
    },
    {
      title: "Quản lý bài viết",
      url: "/admin/posts",
      icon: <FileText className="size-4" />,
      isActive: location.pathname === "/admin/posts",
      // badge: "soon",
    },
    {
      title: "Quản lý tin nhắn",
      url: "/admin/messages",
      icon: <MessageSquare className="size-4" />,
      isActive: location.pathname === "/admin/messages",
      // badge: "soon",
    },
    {
      title: "Báo cáo vi phạm",
      url: "#",
      icon: <ShieldAlert className="size-4" />,
      isActive: location.pathname.startsWith("/admin/reports"),
      items: [
        {
          title: "Bài viết",
          url: "/admin/reports/posts",
          badge: "soon",
        },
        {
          title: "Bình luận",
          url: "/admin/reports/comments",
          badge: "soon",
        },
        {
          title: "Hộp thoại",
          url: "/admin/reports/messages",
          badge: "soon",
        },
        {
          title: "Người dùng",
          url: "/admin/reports/users",
          badge: "soon",
        },
      ],
    },
    {
      title: "Thông báo hệ thống",
      url: "#",
      icon: <Bell className="size-4" />,
      isActive: location.pathname.startsWith("/admin/notifications"),
      items: [
        {
          title: "Template",
          url: "#",
          badge: "soon",
        },
        {
          title: "Tạo thông báo",
          url: "#",
          badge: "soon",
        },
        {
          title: "Lịch sử gửi",
          url: "#",
          badge: "soon",
        },
      ],
    },
    {
      title: "Quảng cáo",
      url: "#",
      icon: <Megaphone className="size-4" />,
      isActive: location.pathname.startsWith("/admin/ads"),
      items: [
        { title: "Chiến dịch", url: "/admin/ads/campaigns", badge: "soon" },
        { title: "Phê duyệt", url: "/admin/ads/review", badge: "soon" },
        { title: "Doanh thu", url: "/admin/ads/revenue", badge: "soon" },
      ],
    },
    {
      title: "Nhật ký hoạt động",
      url: "#",
      icon: <History className="size-4" />,
      badge: "soon",
    },
    {
      title: "Cấu hình hệ thống",
      url: "#",
      icon: <Settings className="size-4" />,
      badge: "soon",
    },
  ];

  const renderBadge = (badge) => {
    if (!badge) return null;
    if (badge === "soon") {
      return (
        <div className="ml-auto rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap">
          Soon
        </div>
      );
    }
    return (
      <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
        {badge}
      </div>
    );
  };

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Terminal className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  PingUp Admin
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Management Panel
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarMenu className="gap-1.5">
            {navItems.map((item) => {
              const hasSubItems = item.items && item.items.length > 0;

              if (hasSubItems) {
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={item.isActive}
                    render={<SidebarMenuItem />}
                  >
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={item.isActive}
                      render={
                        item.url !== "#" ? <Link to={item.url} /> : <button />
                      }
                    >
                      {item.icon}
                      <span className="truncate flex-1 text-left">
                        {item.title}
                      </span>
                      {renderBadge(item.badge)}
                    </SidebarMenuButton>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuAction className="aria-expanded:rotate-90 transition-transform duration-200" />
                      }
                    >
                      <ChevronRight className="size-4" />
                      <span className="sr-only">Toggle {item.title}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="gap-1.5">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              isActive={location.pathname === subItem.url}
                              render={
                                subItem.url !== "#" ? (
                                  <Link to={subItem.url} />
                                ) : (
                                  <span className="flex w-full items-center justify-between" />
                                )
                              }
                            >
                              <span className="truncate flex-1 text-left">
                                {subItem.title}
                              </span>
                              {renderBadge(subItem.badge)}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={item.isActive}
                    render={
                      item.url !== "#" ? (
                        <Link to={item.url} />
                      ) : (
                        <div className="flex w-full items-center" />
                      )
                    }
                  >
                    {item.icon}
                    <span className="truncate flex-1 text-left">
                      {item.title}
                    </span>
                    {renderBadge(item.badge)}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
