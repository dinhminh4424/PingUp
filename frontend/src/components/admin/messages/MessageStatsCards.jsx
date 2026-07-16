import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, User, Users, Trash2 } from "lucide-react";

const MessageStatsCards = ({ stats, loading }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng số hộp thoại
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <MessageSquare className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.totalConversations}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hộp thoại đang hoạt động
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Chat cá nhân (Direct)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <User className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.directConversations}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hội thoại riêng tư 1-1
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nhóm chat (Group)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Users className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.groupConversations}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Các nhóm trò chuyện
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Đã giải tán (Deleted)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
            <Trash2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.deletedConversations}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hộp thoại đã bị xóa/giải tán
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageStatsCards;
