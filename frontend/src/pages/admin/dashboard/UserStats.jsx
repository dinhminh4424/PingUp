import React, { useEffect, useState } from "react";
import { getUserStats } from "../../../services/admin/StatsService";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  ShieldCheck, 
  Calendar,
  BarChart2,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const UserStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' | '30days' | '12months' | 'custom'
  const [roleFilter, setRoleFilter] = useState("all");
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
        const res = await getUserStats(chartPeriod, roleFilter, statusFilter, start, end);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu thống kê người dùng");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [chartPeriod, roleFilter, statusFilter, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Thống kê Người dùng</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="h-28 flex items-center"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const maxRegCount = Math.max(...data.chart.map(d => d.count), 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Thống kê Người dùng
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Báo cáo chi tiết và biểu đồ phân tích thành viên đăng ký mới.
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
              onClick={() => setChartPeriod("12months")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${chartPeriod === "12months" ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              12 Tháng
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

      {/* Grid statistics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers?.toLocaleString("vi-VN") || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượng tài khoản đăng ký hệ thống</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <UserCheck className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeUsers?.toLocaleString("vi-VN") || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang trực tuyến: <span className="font-semibold text-emerald-600">{data?.onlineUsers || 0}</span>
            </p>
          </CardContent>
        </Card>

        {/* Locked Users */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Bị khóa / Vô hiệu hóa</CardTitle>
            <UserX className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data?.blockedUsers?.toLocaleString("vi-VN") || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tài khoản bị tạm khóa/ngắt hoạt động</p>
          </CardContent>
        </Card>

        {/* Verified Accounts */}
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tài khoản đã xác minh</CardTitle>
            <ShieldCheck className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.verifiedUsers?.toLocaleString("vi-VN") || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tài khoản đã được xác thực</p>
          </CardContent>
        </Card>
      </div>

      {/* Network & Friendship Growth Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/10 dark:to-emerald-950/10 border-teal-100 dark:border-teal-900/40 hover:shadow-md transition">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-xl">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tổng số liên kết (Bạn bè)</p>
                <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-400">{data?.connections?.totalConnections || 0} cặp</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 border-amber-100 dark:border-amber-900/40 hover:shadow-md transition">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Trung bình bạn bè / Người dùng</p>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-400">{data?.connections?.avgConnections || 0} bạn</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily/Weekly/Monthly registration stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/10 dark:to-indigo-950/10 border-blue-100 dark:border-blue-900/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <UserPlus className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Đăng ký hôm nay</p>
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400">+{data?.newUsersToday || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/10 dark:to-purple-950/10 border-indigo-100 dark:border-indigo-900/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Đăng ký tuần này</p>
                <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">+{data?.newUsersThisWeek || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10 border-purple-100 dark:border-purple-900/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-xl">
                <BarChart2 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Đăng ký tháng này</p>
                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-400">+{data?.newUsersThisMonth || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Chart Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="size-4 text-indigo-500" />
              Biểu đồ phân tích lượng đăng ký mới
            </CardTitle>
            <CardDescription>Chọn chu kỳ thời gian phù hợp để lọc dữ liệu</CardDescription>
          </div>
          {/* Filters and Chart Period Switcher */}
          <div className="flex flex-wrap items-center gap-3 relative z-20">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng (user)</option>
              <option value="admin">Quản trị viên (admin)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Bị khóa</option>
            </select>

          </div>
        </CardHeader>
        <CardContent className="pt-6 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {/* Shadcn / Recharts Area Chart */}
          <div className="h-[220px] w-full relative">
            {(!data?.chart || data.chart.length === 0) ? (
              <div className="text-center w-full text-muted-foreground text-xs pt-20">Chưa có dữ liệu thống kê đăng ký</div>
            ) : (
              <ChartContainer 
                config={{ 
                  count: { 
                    label: "Đăng ký mới", 
                    color: "var(--color-primary, #2563eb)" 
                  } 
                }} 
                className="h-full w-full"
              >
                <AreaChart data={data.chart} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={8}
                    tickFormatter={(value, index) => {
                      if (chartPeriod === "30days" && index % 4 !== 0 && index !== data.chart.length - 1) return "";
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
                    fill="url(#regGrad)" 
                    stroke="#2563eb" 
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
    </div>
  );
};

export default UserStats;
