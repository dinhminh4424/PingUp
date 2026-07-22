import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { getLogStats } from "../../../services/admin/ActivityLogService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Users, BarChart3, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = [
  "hsl(var(--primary))",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
  "#f43f5e"
];

const ActivityLogStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await getLogStats();
      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      toast.error("Không thể tải số liệu thống kê nhật ký!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-sm text-muted-foreground font-semibold animate-pulse">
        Đang phân tích số liệu thống kê nhật ký...
      </div>
    );
  }

  if (!stats) return null;

  // Format data for action distribution PieChart
  const pieData = stats.actionStats.map((item) => ({
    name: item._id,
    value: item.count,
  })).slice(0, 8); // Top 8 actions

  // Format daily stats for LineChart
  const lineData = stats.dailyStats.map((item) => ({
    date: new Date(item._id).toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
    interactions: item.count,
  }));

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate sum of logs in stats
  const totalInteraction = stats.actionStats.reduce((sum, item) => sum + item.count, 0);

  // Setup Config for Line Chart
  const lineConfig = {
    interactions: {
      label: "Lượt tương tác",
      color: "hsl(var(--primary))",
    },
  };

  // Setup Config for Pie Chart
  const pieConfig = {};
  stats.actionStats.forEach((item, index) => {
    pieConfig[item._id] = {
      label: item._id,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cards stats summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng số tương tác</CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{totalInteraction}</div>
            <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Toàn bộ hoạt động được ghi lại</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Loại hành động</CardTitle>
            <BarChart3 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats.actionStats.length}</div>
            <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Danh mục hoạt động khác nhau</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tài khoản hoạt động</CardTitle>
            <Users className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground">{stats.topUsers.length}</div>
            <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium font-semibold text-emerald-600 dark:text-emerald-400">
              Đang hoạt động tích cực
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily interactions trend LineChart */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b pb-4 border-border/60">
            <CardTitle className="text-sm font-bold text-foreground">Biểu đồ tần suất tương tác hệ thống (7 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <ChartContainer config={lineConfig} className="h-full w-full">
                <LineChart data={lineData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="interactions" stroke="var(--color-interactions)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Action breakdown PieChart */}
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b pb-4 border-border/60">
            <CardTitle className="text-sm font-bold text-foreground">Cơ cấu loại hình hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[300px] flex items-center justify-between gap-4">
            {pieData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <>
                <ChartContainer config={pieConfig} className="w-1/2 h-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
                <div className="w-1/2 flex flex-col gap-2 overflow-y-auto max-h-full pr-1">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium truncate">
                        <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {entry.name}
                      </span>
                      <span className="font-bold text-muted-foreground shrink-0 ml-1">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top Active Users */}
        <Card className="border-border shadow-sm bg-card md:col-span-2">
          <CardHeader className="border-b pb-4 border-border/60">
            <CardTitle className="text-sm font-bold text-foreground">Top 5 tài khoản hoạt động nhiều nhất</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {stats.topUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Người dùng</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-right">Tổng số hoạt động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {stats.topUsers.map((item) => {
                      const user = item.userInfo;
                      return (
                        <tr key={user._id} className="hover:bg-muted/15 transition-colors text-sm font-medium">
                          <td className="p-4 flex items-center gap-3">
                            <Avatar className="size-8 border">
                              <AvatarImage src={user.profile_picture} className="object-cover" />
                              <AvatarFallback className="text-[10px] font-bold">
                                {getInitials(user.full_name || user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-foreground">{user.full_name || `@${user.username}`}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">{user.email}</td>
                          <td className="p-4 text-right font-bold text-primary">{item.count}</td>
                        </tr>
                      );
                    })}
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

export default ActivityLogStats;
