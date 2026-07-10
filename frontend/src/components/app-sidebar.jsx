"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LifeBuoyIcon,
  SendIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  TerminalIcon,
} from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Quản lý báo cáo vi phạm",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        {
          title: "Bài viết",
          url: "#",
        },
        {
          title: "Bình luận",
          url: "#",
        },
        {
          title: "Hộp thoại",
          url: "#",
        },
        {
          title: "Người dùng",
          url: "#",
        },
      ],
    },
    {
      title: "Quản lý thông báo hệ thống",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Template",
          url: "#",
        },
        {
          title: "Tạo",
          url: "#",
        },
        {
          title: "Gửi",
          url: "#",
        },
      ],
    },
    {
      title: "Quản lý quảng cáo",
      url: "#",
      icon: <BotIcon />,
      items: [
        {
          title: "Template",
          url: "#",
        },
        {
          title: "Tạo",
          url: "#",
        },
        {
          title: "Gửi",
          url: "#",
        },
      ],
    },
    {
      title: "Dashboard",
      url: "#",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Tổng quan",
          url: "#",
        },
        {
          title: "Người Dùng",
          url: "#",
        },
        {
          title: "Bài viết",
          url: "#",
        },
        {
          title: "Action",
          url: "#",
        },
      ],
    },
    {
      title: "Nhật ký hoạt động",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: <LifeBuoyIcon />,
    },
    {
      title: "Feedback",
      url: "/",
      icon: <SendIcon />,
    },
  ],
  projects: [
    {
      name: "Quản lý người dùng",
      url: "#",
      icon: <FrameIcon />,
    },
    {
      name: "Quản lý bài viết",
      url: "#",
      icon: <PieChartIcon />,
    },
    {
      name: "Quản lý tin nhắn",
      url: "#",
      icon: <MapIcon />,
    },
    {
      name: "Quản lý quảng cáo",
      url: "#",
      icon: <MapIcon />,
    },
  ],
};
export function AppSidebar({ ...props }) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Acme Inc</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
