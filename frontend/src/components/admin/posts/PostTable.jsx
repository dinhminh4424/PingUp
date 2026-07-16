import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  ImageIcon,
  ShieldAlert,
  Eye,
  Ban,
  Check,
  RotateCcw,
  Trash2,
} from "lucide-react";

const PostTable = ({
  posts,
  loading,
  onViewDetail,
  onToggleActive,
  onToggleDelete,
  formatDate,
}) => {
  const getInitials = (name) => {
    if (!name) return "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rounded-b-xl border-t">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[180px] pl-6 py-3">Người đăng</TableHead>
            <TableHead className="min-w-[240px]">Nội dung bài viết</TableHead>
            <TableHead className="w-[80px] text-center">Thích</TableHead>
            <TableHead className="w-[90px] text-center">Bình luận</TableHead>
            <TableHead className="w-[80px] text-center">Chia sẻ</TableHead>
            <TableHead className="w-[110px]">Báo cáo</TableHead>
            <TableHead className="w-[110px]">Trạng thái</TableHead>
            <TableHead className="w-[150px]">Ngày đăng</TableHead>
            <TableHead className="w-[130px] text-center pr-6">Hành động</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-64" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="pr-6 text-center">
                  <div className="flex justify-center gap-1">
                    <Skeleton className="size-8 rounded-lg" />
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <FileText className="size-8 text-muted-foreground/50" />
                  <p className="font-medium text-sm">Không tìm thấy bài viết nào</p>
                  <p className="text-xs">Thay đổi từ khóa hoặc bộ lọc để xem kết quả.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post._id} className="hover:bg-muted/20 transition-colors">
                {/* Author */}
                <TableCell className="pl-6 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 border border-border">
                      <AvatarImage
                        src={post.user?.profile_picture}
                        alt={post.user?.full_name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                        {getInitials(post.user?.full_name || post.user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs truncate max-w-[100px]">
                        {post.user?.full_name || "Chưa thiết lập"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                        @{post.user?.username}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Content preview */}
                <TableCell className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {post.content || <span className="italic text-gray-400">Không có văn bản</span>}
                    </p>
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-500">
                        <ImageIcon size={12} />
                        <span>{post.image_urls.length} ảnh đính kèm</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Likes count */}
                <TableCell className="text-center font-medium text-xs text-gray-700 dark:text-gray-300">
                  {post.likesCountValue || post.likes_count?.length || 0}
                </TableCell>

                {/* Comments count */}
                <TableCell className="text-center font-medium text-xs text-gray-700 dark:text-gray-300">
                  {post.comments_count || 0}
                </TableCell>

                {/* Shares count */}
                <TableCell className="text-center font-medium text-xs text-gray-700 dark:text-gray-300">
                  {post.shares_count || 0}
                </TableCell>

                {/* Report Count */}
                <TableCell>
                  {post.reports_count > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="size-3 text-amber-500 animate-bounce" />
                      {post.reports_count} báo cáo
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">0</span>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {post.isDelete ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Đã xóa
                    </span>
                  ) : post.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Bị khóa
                    </span>
                  )}
                </TableCell>

                {/* Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(post.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-6">
                  <div className="flex items-center justify-center gap-1">
                    {/* View detail */}
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => onViewDetail(post)}
                      title="Xem chi tiết"
                    >
                      <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>

                    {/* Block/Unblock */}
                    {!post.isDelete && (
                      <Button
                        variant={post.isActive ? "outline" : "destructive"}
                        size="icon-xs"
                        onClick={() => onToggleActive(post._id)}
                        title={post.isActive ? "Khóa bài viết" : "Mở khóa bài viết"}
                      >
                        {post.isActive ? (
                          <Ban className="size-3.5 text-rose-500" />
                        ) : (
                          <Check className="size-3.5 text-emerald-600" />
                        )}
                      </Button>
                    )}

                    {/* Soft delete / restore */}
                    <Button
                      variant={post.isDelete ? "default" : "outline"}
                      size="icon-xs"
                      onClick={() => onToggleDelete(post._id)}
                      title={post.isDelete ? "Khôi phục bài viết" : "Xóa bài viết"}
                    >
                      {post.isDelete ? (
                        <RotateCcw className="size-3.5 text-indigo-600" />
                      ) : (
                        <Trash2 className="size-3.5 text-rose-500" />
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
  );
};

export default PostTable;
