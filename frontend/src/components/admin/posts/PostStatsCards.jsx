import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ShieldCheck, Ban, Trash2 } from "lucide-react";

const PostStatsCards = ({ stats, loading }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng số bài viết
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
            <FileText className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.totalPosts}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Bài viết đang hoạt động
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Công khai (Active)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.activePosts}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Hiển thị bình thường
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Đang bị khóa (Blocked)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Ban className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.blockedPosts}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Ẩn do vi phạm tiêu chuẩn
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-xs hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Đã xóa (Deleted)
          </CardTitle>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
            <Trash2 className="size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.deletedPosts}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Bài viết nằm trong thùng rác
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostStatsCards;
