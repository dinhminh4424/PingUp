import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Activity, Shield } from "lucide-react";

const UserStatsCards = ({ stats, loading }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng số người dùng
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.totalUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tài khoản đã đăng ký
          </p>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Đang hoạt động
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <UserCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.activeUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Không bị khóa tài khoản
          </p>
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Trực tuyến
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
            <Activity className="size-4 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.onlineUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Đang trực tuyến trên app
          </p>
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Quản trị viên
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Shield className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.adminUsers}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tài khoản có quyền admin
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
