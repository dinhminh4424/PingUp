import React, { useEffect, useState } from "react";
import { getReportStats } from "../../../services/admin/StatsService";
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertTriangle,
  FileText,
  User,
  MessageSquare,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ReportStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' | '30days' | 'custom'
  const [targetTypeFilter, setTargetTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const start = chartPeriod === "custom" ? startDate : null;
        const end = chartPeriod === "custom" ? endDate : null;
        const res = await getReportStats(chartPeriod, targetTypeFilter, statusFilter, start, end);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu thống kê báo cáo");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [chartPeriod, targetTypeFilter, statusFilter, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Thống kê Kiểm duyệt & Báo cáo</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  const { summary = {}, chart = [], leaderboards = {}, recentReports = [] } = data || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Thống kê Kiểm duyệt & Báo cáo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi, xử lý và phân tích các báo cáo nội dung vi phạm trên mạng xã hội
          </p>
        </div>

        {/* Global Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-3 relative z-20">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200/50 dark:border-gray-700/50 w-fit">
            <button 
              onClick={() => setChartPeriod("7days")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${chartPeriod === "7days" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              7 Ngày
            </button>
            <button 
              onClick={() => setChartPeriod("30days")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${chartPeriod === "30days" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              30 Ngày
            </button>
            <button 
              onClick={() => setChartPeriod("custom")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${chartPeriod === "custom" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tùy chọn
            </button>
          </div>

          {chartPeriod === "custom" && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1.5 rounded-lg">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-foreground focus:outline-hidden px-1 cursor-pointer"
              />
              <span>đến</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-foreground focus:outline-hidden px-1 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reports */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tổng số báo cáo</p>
              <h3 className="text-3xl font-extrabold text-foreground">{summary.totalReports || 0}</h3>
              <p className="text-xs text-emerald-500 font-medium">+{summary.newReportsToday || 0} hôm nay</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl text-red-600 dark:text-red-400">
              <ShieldAlert className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Reports */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Chờ giải quyết</p>
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{summary.pendingReports || 0}</h3>
              <p className="text-xs text-muted-foreground">Cần Admin kiểm duyệt</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Resolved Reports */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Đã xử lý</p>
              <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{summary.resolvedReports || 0}</h3>
              <p className="text-xs text-muted-foreground">Bài viết/User đã bị ẩn/khóa</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Dismissed Reports */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Bỏ qua / Từ chối</p>
              <h3 className="text-3xl font-extrabold text-slate-600 dark:text-slate-400">{summary.dismissedReports || 0}</h3>
              <p className="text-xs text-muted-foreground">Báo cáo không vi phạm</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500">
              <XCircle className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Section */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-2 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="size-4 text-red-500" />
              Tần suất báo cáo vi phạm
            </CardTitle>
            <CardDescription>Biến động lượng báo cáo gửi lên hệ thống</CardDescription>
          </div>
          {/* Advanced Filtering controls */}
          <div className="flex flex-wrap items-center gap-3 relative z-20">
            {/* Target Type Filter */}
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả mục báo cáo</option>
              <option value="post">Bài viết</option>
              <option value="comment">Bình luận</option>
              <option value="message">Tin nhắn</option>
              <option value="user">Người dùng</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả trạng thái xử lý</option>
              <option value="pending">Chờ giải quyết (pending)</option>
              <option value="resolved">Đã xử lý (resolved)</option>
              <option value="dismissed">Bỏ qua (dismissed)</option>
            </select>

          </div>
        </CardHeader>
        <CardContent className="h-[280px] pt-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          <div className="h-full w-full">
            {(!chart || chart.length === 0) ? (
              <div className="text-center w-full text-muted-foreground text-xs pt-20">Chưa có dữ liệu thống kê báo cáo vi phạm</div>
            ) : (
              <ChartContainer 
                config={{ 
                  count: { label: "Số lượng báo cáo", color: "#ef4444" } 
                }} 
                className="h-full w-full"
              >
                <AreaChart data={chart} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value, index) => {
                      if (chartPeriod === "30days" && index % 4 !== 0 && index !== chart.length - 1) return "";
                      return value;
                    }}
                    style={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    style={{ fontSize: 10, fill: "#64748b" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    name="count"
                    dataKey="count" 
                    type="monotone" 
                    fill="url(#reportGrad)" 
                    stroke="#ef4444" 
                    strokeWidth={2} 
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid of leaderboards and lists */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Reasons breakdown */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-4 text-amber-500" />
              Lý do báo cáo phổ biến
            </CardTitle>
            <CardDescription>Phân loại lý do người dùng gửi báo cáo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(!leaderboards.topReasons || leaderboards.topReasons.length === 0) ? (
              <div className="text-center py-10 text-muted-foreground text-xs">Chưa có lý do báo cáo</div>
            ) : (
              leaderboards.topReasons.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground">{item._id}</span>
                    <span className="text-muted-foreground font-mono">{item.count} lượt</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.count / (leaderboards.topReasons[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Reports List */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-indigo-500" />
              Danh sách báo cáo gần đây
            </CardTitle>
            <CardDescription>Báo cáo gửi lên cần phê duyệt</CardDescription>
          </CardHeader>
          <CardContent>
            {(!recentReports || recentReports.length === 0) ? (
              <div className="text-center py-12 text-muted-foreground text-xs">Không có báo cáo nào gần đây</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-semibold">Người báo cáo</th>
                      <th className="pb-3 font-semibold">Loại mục</th>
                      <th className="pb-3 font-semibold">Lý do</th>
                      <th className="pb-3 font-semibold text-center">Trạng thái</th>
                      <th className="pb-3 font-semibold text-right">Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((report) => (
                      <tr key={report._id} className="border-b border-border/40 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reporterId?.profile_picture} />
                            <AvatarFallback className="text-[10px]">{report.reporterId?.full_name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground leading-none">{report.reporterId?.full_name}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">@{report.reporterId?.username}</span>
                          </div>
                        </td>
                        <td className="py-3 font-medium">
                          <span className="inline-flex items-center gap-1">
                            {report.targetType === "post" && <FileText className="size-3 text-blue-500" />}
                            {report.targetType === "comment" && <MessageSquare className="size-3 text-pink-500" />}
                            {report.targetType === "user" && <User className="size-3 text-purple-500" />}
                            <span className="capitalize">{report.targetType}</span>
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground max-w-[120px] truncate">{report.reason}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            report.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                            report.status === "resolved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportStats;
