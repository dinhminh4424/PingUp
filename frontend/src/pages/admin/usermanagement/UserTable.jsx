import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  Shield,
  ShieldAlert,
  Eye,
  Mail,
  User,
  Check,
  Ban,
} from "lucide-react";

const UserTable = ({
  users,
  loading,
  totalUsersCount,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  page,
  setPage,
  totalPages,
  handleToggleActive,
  handleToggleRole,
  handleViewDetails,
}) => {
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Danh sách thành viên</CardTitle>
            <CardDescription>
              Hiện có {totalUsersCount} người dùng phù hợp với bộ lọc.
            </CardDescription>
          </div>

          {/* Search and Filter Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm tên, username, email..."
                className="pl-8 h-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Thành viên (User)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>

            {/* Status Filter */}
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Bị khóa</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="rounded-b-xl border-t">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[280px] pl-6 py-3">Người dùng</TableHead>
                <TableHead className="w-[220px]">Email</TableHead>
                <TableHead className="w-[120px]">Vai trò</TableHead>
                <TableHead className="w-[120px]">Trạng thái</TableHead>
                <TableHead className="w-[110px]">Kết nối</TableHead>
                <TableHead className="w-[150px]">Ngày tham gia</TableHead>
                <TableHead className="w-[150px] text-center pr-6">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full" />
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="size-2 rounded-full" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="pr-6 text-center">
                      <div className="flex justify-center gap-1">
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="size-8 rounded-lg" />
                        <Skeleton className="size-8 rounded-lg" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-muted-foreground/50" />
                      <p className="font-medium text-sm">Không tìm thấy người dùng nào</p>
                      <p className="text-xs">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/20 transition-colors">
                    {/* Name & Avatar */}
                    <TableCell className="pl-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border border-border">
                          <AvatarImage
                            src={user.profile_picture}
                            alt={user.full_name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                            {getInitials(user.full_name || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm truncate max-w-[180px]">
                            {user.full_name || "Chưa thiết lập"}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-muted-foreground/60" />
                        <span className="truncate max-w-[190px]">{user.email}</span>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      {user.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <Shield className="size-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                          <User className="size-3" />
                          User
                        </span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <span className="size-1.5 rounded-full bg-rose-500" />
                          Bị khóa
                        </span>
                      )}
                    </TableCell>

                    {/* Online */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`size-2 rounded-full ${
                            user.activeOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/45"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {user.activeOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Join Date */}
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Info */}
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleViewDetails(user._id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>

                        {/* Toggle Role */}
                        <Button
                          variant="outline"
                          size="icon-xs"
                          onClick={() => handleToggleRole(user._id)}
                          title={user.role === "admin" ? "Hạ quyền xuống User" : "Thăng quyền lên Admin"}
                        >
                          <ShieldAlert
                            className={`size-3.5 ${user.role === "admin" ? "text-amber-500" : "text-indigo-500"}`}
                          />
                        </Button>

                        {/* Block / Unblock */}
                        <Button
                          variant={user.isActive ? "outline" : "destructive"}
                          size="icon-xs"
                          onClick={() => handleToggleActive(user._id)}
                          title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        >
                          {user.isActive ? (
                            <Ban className="size-3.5 text-rose-500" />
                          ) : (
                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/10">
            <div className="text-xs text-muted-foreground">
              Hiển thị trang <span className="font-semibold text-foreground">{page}</span> trên tổng số{" "}
              <span className="font-semibold text-foreground">{totalPages}</span> trang ({totalUsersCount} kết quả)
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="h-8 text-xs"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    totalPages > 6 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - page) > 1
                  ) {
                    if (pageNum === 2 && page > 3) {
                      return (
                        <span key={pageNum} className="px-1.5 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    if (pageNum === totalPages - 1 && page < totalPages - 2) {
                      return (
                        <span key={pageNum} className="px-1.5 text-xs text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 text-xs p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="h-8 text-xs"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTable;
