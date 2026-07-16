import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getConversations,
  getConversationMessages,
  deleteMessage,
  toggleConversationActive,
  toggleConversationDelete,
} from "@/services/admin/MessageService";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, RotateCcw } from "lucide-react";

import DateRangeFilter from "@/components/admin/DateRangeFilter";
import MessageStatsCards from "@/components/admin/messages/MessageStatsCards";
import MessageTable from "@/components/admin/messages/MessageTable";
import MessageDetailModal from "@/components/admin/messages/MessageDetailModal";

const MessageManagement = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Date filter state
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [filterResetKey, setFilterResetKey] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConversationsCount, setTotalConversationsCount] = useState(0);

  // Messages viewer modal state
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotalPages, setMessagesTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    totalConversations: 0,
    directConversations: 0,
    groupConversations: 0,
    deletedConversations: 0,
    totalMessages: 0,
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchConversations = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getConversations(
        debouncedSearchQuery,
        statusFilter,
        dateRange.startDate,
        dateRange.endDate,
        page
      );
      if (result.success) {
        setConversations(result.conversations);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalConversationsCount(result.pagination.totalConversations || 0);
        }
        if (result.stats) {
          setStats(result.stats);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách hội thoại"
      );
      toast.error(
        err.response?.data?.message || "Lỗi tải dữ liệu hội thoại!"
      );
      console.error("Lỗi: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [debouncedSearchQuery, statusFilter, dateRange, page]);

  // Fetch messages when a conversation is selected
  const fetchMessages = async (convId, mPage = 1) => {
    setMessagesLoading(true);
    try {
      const result = await getConversationMessages(convId, mPage);
      if (result.success) {
        if (mPage === 1) {
          setMessages(result.messages);
        } else {
          setMessages((prev) => [...prev, ...result.messages]);
        }
        setMessagesPage(result.pagination.currentPage || 1);
        setMessagesTotalPages(result.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Không thể tải tin nhắn!"
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      setMessages([]);
      setMessagesPage(1);
      fetchMessages(selectedConversation._id, 1);
    }
  }, [selectedConversation]);

  const handleDateFilterChange = (range) => {
    setDateRange(range);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setFilterResetKey((prev) => prev + 1);
    setPage(1);
    toast.success("Đã đặt lại các bộ lọc");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này? Tin nhắn sẽ được thay thế bằng thông báo đã bị Admin xóa.")) {
      return;
    }
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        toast.success(result.message);

        // Update locally in messages array
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, content: "Tin nhắn này đã bị xóa bởi Admin", imageUrl: [] }
              : msg
          )
        );

        // Also update conversations list preview if the deleted message was lastMessage
        setConversations((prevConvs) =>
          prevConvs.map((c) => {
            if (c.lastMessage && c.lastMessage._id === messageId) {
              return {
                ...c,
                lastMessage: {
                  ...c.lastMessage,
                  content: "Tin nhắn này đã bị xóa bởi Admin",
                },
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi xóa tin nhắn!"
      );
    }
  };

  const handleToggleActiveConversation = async (convId) => {
    try {
      const result = await toggleConversationActive(convId);
      if (result.success) {
        toast.success(result.message);

        setConversations((prevConvs) =>
          prevConvs.map((conv) =>
            conv._id === convId ? { ...conv, isActive: result.conversation.isActive } : conv
          )
        );

        if (selectedConversation && selectedConversation._id === convId) {
          setSelectedConversation((prev) => ({ ...prev, isActive: result.conversation.isActive }));
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái hoạt động cuộc trò chuyện!"
      );
    }
  };

  const handleToggleDeleteConversation = async (convId) => {
    try {
      const result = await toggleConversationDelete(convId);
      if (result.success) {
        toast.success(result.message);

        const matched = conversations.find((c) => c._id === convId);
        const isGroup = matched && matched.type === "group";
        const msgCount = matched ? (matched.message_count || 0) : 0;

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c._id === convId ? { ...c, isDelete: result.conversation.isDelete } : c
          );
          if (statusFilter === "deleted" && !result.conversation.isDelete) {
            return updated.filter((c) => c._id !== convId);
          }
          if (statusFilter !== "deleted" && result.conversation.isDelete) {
            return updated.filter((c) => c._id !== convId);
          }
          return updated;
        });

        setStats((prevStats) => {
          const isNowDeleted = result.conversation.isDelete;
          return {
            ...prevStats,
            totalConversations: prevStats.totalConversations + (isNowDeleted ? -1 : 1),
            directConversations: Math.max(0, prevStats.directConversations - (isNowDeleted ? (isGroup ? 0 : 1) : (isGroup ? 0 : -1))),
            groupConversations: Math.max(0, prevStats.groupConversations - (isNowDeleted ? (isGroup ? 1 : 0) : (isGroup ? -1 : 0))),
            deletedConversations: prevStats.deletedConversations + (isNowDeleted ? 1 : -1),
            totalMessages: Math.max(0, prevStats.totalMessages + (isNowDeleted ? -msgCount : msgCount)),
          };
        });

        if (selectedConversation && selectedConversation._id === convId) {
          setSelectedConversation((prev) => ({ ...prev, isDelete: result.conversation.isDelete }));
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Lỗi khi cập nhật trạng thái xóa cuộc trò chuyện!"
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tin nhắn</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi danh sách các hộp thoại chat, số lượng tin nhắn và quản lý kiểm duyệt nội dung tin nhắn.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConversations}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <MessageStatsCards stats={stats} loading={loading} />

      {/* Main Table Card */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Danh sách hội thoại</CardTitle>
              <CardDescription>
                Hiện có {totalConversationsCount} hội thoại phù hợp với bộ lọc.
              </CardDescription>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm nhóm chat, thành viên..."
                  className="pl-8 h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

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
                <option value="active">Đang hoạt động</option>
                <option value="blocked">Đang bị khóa</option>
                <option value="deleted">Đã giải tán (Deleted)</option>
              </select>

              {/* Date Filter Component */}
              <DateRangeFilter key={filterResetKey} onFilterChange={handleDateFilterChange} />

              {/* Reset Filters Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                title="Đặt lại tất cả bộ lọc"
              >
                <RotateCcw className="size-3" />
                Đặt lại
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <MessageTable
            conversations={conversations}
            loading={loading}
            onViewDetail={setSelectedConversation}
            onToggleActive={handleToggleActiveConversation}
            onToggleDelete={handleToggleDeleteConversation}
            formatDate={formatDate}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Hiển thị trang <span className="font-semibold text-foreground">{page}</span> trên tổng số{" "}
                <span className="font-semibold text-foreground">{totalPages}</span> trang ({totalConversationsCount} kết quả)
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

      {/* Message details modal */}
      {selectedConversation && (
        <MessageDetailModal
          conversation={selectedConversation}
          messages={messages}
          messagesLoading={messagesLoading}
          messagesPage={messagesPage}
          messagesTotalPages={messagesTotalPages}
          onClose={() => setSelectedConversation(null)}
          onDeleteMessage={handleDeleteMessage}
          onLoadMore={() => fetchMessages(selectedConversation._id, messagesPage + 1)}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

export default MessageManagement;
