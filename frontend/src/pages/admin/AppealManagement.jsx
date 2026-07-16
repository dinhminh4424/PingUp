import React, { useState } from "react";
import { Scale, Check, X, AlertCircle, Eye, Search, Filter, RotateCcw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import toast from "react-hot-toast";

const AppealManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [appeals, setAppeals] = useState([
    {
      id: "APL-7294",
      user: "NguoiDung01",
      email: "NguoiDung01@gmail.com",
      type: "Gỡ bài viết",
      targetId: "post_182749",
      reason: "Bài viết này chỉ là một bức ảnh hoàng hôn từ chuyến đi của tôi. Nó không chứa bất kỳ vi phạm chính sách hay nội dung rác nào. Vui lòng xem xét lại.",
      date: "2026-07-14",
      status: "Pending",
      media: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e"],
    },
    {
      id: "APL-6028",
      user: "dinhminh4424",
      email: "dinhminh4424@gmail.com",
      type: "Hạn chế tính năng",
      targetId: "chat_limit",
      reason: "Tôi chỉ gửi một liên kết cho bạn của tôi để nhờ giúp làm bài tập, không phải spam. Vui lòng mở khóa tính năng trò chuyện của tôi.",
      date: "2026-07-13",
      status: "Pending",
      media: ["https://images.unsplash.com/photo-1434030216411-0b793f4b4173"],
    },
    {
      id: "APL-1048",
      user: "jack_ryan",
      email: "jack@example.com",
      type: "Cảnh cáo tài khoản",
      targetId: "strike_1",
      reason: "Hệ thống đã gắn cờ bình luận của tôi là quấy rối, nhưng đó chỉ là một câu trích dẫn trong phim. Tôi không có ý xúc phạm ai cả.",
      date: "2026-07-10",
      status: "Resolved",
      result: "Decision Upheld",
      media: [],
    },
  ]);

  const [selectedAppeal, setSelectedAppeal] = useState(null);

  const handleAction = (id, newStatus, resultMessage) => {
    setAppeals((prev) =>
      prev.map((apl) =>
        apl.id === id
          ? { ...apl, status: newStatus, result: resultMessage }
          : apl
      )
    );
    if (selectedAppeal && selectedAppeal.id === id) {
      setSelectedAppeal((prev) => ({ ...prev, status: newStatus, result: resultMessage }));
    }
  };

  const filteredAppeals = appeals.filter((apl) => {
    const matchesSearch =
      apl.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apl.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || apl.status.toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    toast.success("Đã đặt lại bộ lọc");
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" />
            Quản lý khiếu nại người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem xét và xử lý các khiếu nại về nội dung và cảnh cáo tài khoản từ người dùng.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Table List Card */}
        <Card className="flex-1 shadow-xs border-border w-full overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Danh sách kháng cáo</CardTitle>
                <CardDescription>
                  Hiện có {filteredAppeals.length} yêu cầu phù hợp với bộ lọc.
                </CardDescription>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo người dùng, ID, lý do..."
                    className="pl-8 h-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="resolved">Đã giải quyết</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw className="size-3" />
                  Đặt lại
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[120px] pl-6 py-3">Mã khiếu nại</TableHead>
                  <TableHead className="min-w-[150px]">Người dùng</TableHead>
                  <TableHead className="w-[150px]">Loại khiếu nại</TableHead>
                  <TableHead className="w-[120px]">Ngày tạo</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[150px] text-right pr-6">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppeals.map((appeal) => (
                  <TableRow key={appeal.id} className="hover:bg-muted/10 transition">
                    <TableCell className="pl-6 font-semibold text-foreground">{appeal.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{appeal.user}</p>
                        <p className="text-xs text-muted-foreground">{appeal.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground">
                        {appeal.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{appeal.date}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        appeal.status === "Pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {appeal.status === "Pending" ? "Chờ xử lý" : "Đã giải quyết"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedAppeal(appeal)}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition cursor-pointer"
                          title="Xem Chi Tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {appeal.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleAction(appeal.id, "Resolved", "Approved (Restored)")}
                              className="p-1.5 hover:bg-emerald-500/15 rounded-lg text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                              title="Chấp nhận"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(appeal.id, "Resolved", "Decision Upheld")}
                              className="p-1.5 hover:bg-rose-500/15 rounded-lg text-rose-600 dark:text-rose-455 transition cursor-pointer"
                              title="Từ chối"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAppeals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">
                      Không tìm thấy khiếu nại nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Details Sidebar panel */}
        {selectedAppeal && (
          <Card className="w-full lg:w-96 shadow-xs border-border flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
            <CardHeader className="pb-4 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-lg">Chi tiết khiếu nại</CardTitle>
                <CardDescription className="text-xs">{selectedAppeal.id}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAppeal(null)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <hr className="border-border" />

              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Người dùng</span>
                  <p className="font-medium text-foreground">{selectedAppeal.user} ({selectedAppeal.email})</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mã nội dung</span>
                  <p className="font-medium text-foreground bg-muted/50 p-1.5 rounded-lg text-xs break-all mt-1">{selectedAppeal.targetId}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loại khiếu nại</span>
                  <p className="font-medium text-foreground">{selectedAppeal.type}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nội dung / Lý do khiếu nại</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-3 rounded-xl border border-border text-xs italic">
                    "{selectedAppeal.reason}"
                  </p>
                </div>
                {selectedAppeal.media && selectedAppeal.media.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Tệp / Hình ảnh đính kèm</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {selectedAppeal.media.map((url, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                          <img
                            src={url}
                            alt=""
                            className="w-full h-full object-cover cursor-zoom-in hover:opacity-95 transition"
                            onClick={() => window.open(url, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedAppeal.result && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kết quả giải quyết</span>
                    <p className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 p-2 rounded-lg text-xs mt-1">
                      {selectedAppeal.result === "Approved (Restored)" ? "Đã khôi phục" : "Giữ nguyên quyết định xử lý"}
                    </p>
                  </div>
                )}
              </div>

              {selectedAppeal.status === "Pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleAction(selectedAppeal.id, "Resolved", "Approved (Restored)")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Chấp nhận
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(selectedAppeal.id, "Resolved", "Decision Upheld")}
                    className="flex-1 font-semibold text-xs rounded-xl"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Từ chối
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AppealManagement;
