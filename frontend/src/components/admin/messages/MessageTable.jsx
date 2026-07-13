import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Eye,
  Ban,
  Check,
  RotateCcw,
  Trash2,
} from "lucide-react";

const MessageTable = ({
  conversations,
  loading,
  onViewDetail,
  onToggleActive,
  onToggleDelete,
  formatDate,
}) => {
  const getInitials = (name) => {
    if (!name) return "C";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConversationDetails = (conv) => {
    if (conv.type === "group") {
      return {
        title: conv.group?.name || "Nhóm trò chuyện",
        image: conv.group?.imageGroup || "",
        fallback: getInitials(conv.group?.name || "Group"),
      };
    }
    const partner = conv.participants && conv.participants.length > 0
      ? conv.participants[0]?.userId
      : null;

    return {
      title: partner ? partner.full_name : "Người dùng PingUp",
      image: partner ? partner.profile_picture : "",
      fallback: partner ? getInitials(partner.full_name) : "U",
      username: partner ? `@${partner.username}` : "",
    };
  };

  return (
    <div className="rounded-b-xl border-t">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[220px] pl-6 py-3">Tên hộp thoại / Nhóm</TableHead>
            <TableHead className="w-[110px]">Phân loại</TableHead>
            <TableHead className="w-[100px] text-center">Thành viên</TableHead>
            <TableHead className="min-w-[180px]">Tin nhắn cuối</TableHead>
            <TableHead className="w-[110px]">Số tin nhắn</TableHead>
            <TableHead className="w-[110px]">Trạng thái</TableHead>
            <TableHead className="w-[150px]">Hoạt động cuối</TableHead>
            <TableHead className="w-[140px] text-center pr-6">Hành động</TableHead>
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
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-8 mx-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="pr-6 text-center">
                  <Skeleton className="size-8 rounded-lg mx-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : conversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-48 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <MessageSquare className="size-8 text-muted-foreground/50" />
                  <p className="font-medium text-sm">Không tìm thấy cuộc hội thoại nào</p>
                  <p className="text-xs">Thử tìm kiếm với tên hoặc từ khóa khác.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            conversations.map((conv) => {
              const details = getConversationDetails(conv);
              return (
                <TableRow key={conv._id} className="hover:bg-muted/20 transition-colors">
                  {/* Conversation title */}
                  <TableCell className="pl-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border">
                        <AvatarImage
                          src={details.image}
                          alt={details.title}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                          {details.fallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate max-w-[180px]">
                          {details.title}
                        </span>
                        {details.username && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {details.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Type */}
                  <TableCell>
                    {conv.type === "group" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Nhóm (Group)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        Cá nhân (1-1)
                      </span>
                    )}
                  </TableCell>

                  {/* Members count */}
                  <TableCell className="text-center font-medium text-xs text-gray-700 dark:text-gray-300">
                    {conv.participants?.length || 0}
                  </TableCell>

                  {/* Last message content */}
                  <TableCell className="max-w-xs">
                    <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                      {conv.lastMessage?.content || <span className="italic text-gray-400">Không có tin nhắn</span>}
                    </p>
                  </TableCell>

                  {/* Message count */}
                  <TableCell className="text-xs font-semibold text-gray-700">
                    {conv.message_count || 0} tin nhắn
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {conv.isDelete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Đã giải tán
                      </span>
                    ) : conv.isActive !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Bị khóa
                      </span>
                    )}
                  </TableCell>

                  {/* Last message time */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(conv.lastMessageAt || conv.updatedAt)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => onViewDetail(conv)}
                        title="Xem chi tiết cuộc trò chuyện"
                      >
                        <Eye className="size-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      {!conv.isDelete && (
                        <Button
                          variant={conv.isActive !== false ? "outline" : "destructive"}
                          size="icon-xs"
                          onClick={() => onToggleActive(conv._id)}
                          title={conv.isActive !== false ? "Vô hiệu hóa hộp thoại" : "Kích hoạt hộp thoại"}
                        >
                          {conv.isActive !== false ? (
                            <Ban className="size-3.5 text-rose-500" />
                          ) : (
                            <Check className="size-3.5 text-emerald-600" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant={conv.isDelete ? "default" : "outline"}
                        size="icon-xs"
                        onClick={() => onToggleDelete(conv._id)}
                        title={conv.isDelete ? "Khôi phục cuộc trò chuyện" : "Giải tán/Xóa cuộc trò chuyện"}
                      >
                        {conv.isDelete ? (
                          <RotateCcw className="size-3.5 text-indigo-600" />
                        ) : (
                          <Trash2 className="size-3.5 text-rose-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default MessageTable;
