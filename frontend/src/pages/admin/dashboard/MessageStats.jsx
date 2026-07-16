import React, { useEffect, useState } from "react";
import { getMessageStats } from "../../../services/admin/StatsService";
import { 
  MessageSquare,
  Clock, 
  Smile, 
  Calendar,
  Award,
  Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MessageStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' | '30days' | 'custom'
  
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
        const res = await getMessageStats(chartPeriod, start, end);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu thống kê tin nhắn");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [chartPeriod, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Thống kê Tin nhắn & Trò chuyện</h1>
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

  const { summary = {}, chart = [], leaderboards = {} } = data || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Thống kê Tin nhắn & Trò chuyện</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi khối lượng tin nhắn, hội thoại đang mở và hành vi tương tác biểu cảm của người dùng
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
        {/* Total Messages */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tổng tin nhắn</p>
              <h3 className="text-3xl font-extrabold text-foreground">{(summary.totalMessages || 0).toLocaleString("vi-VN")}</h3>
              <p className="text-xs text-emerald-500 font-medium">+{summary.messagesToday || 0} hôm nay</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active Conversations */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cuộc trò chuyện</p>
              <h3 className="text-3xl font-extrabold text-foreground">{(summary.activeConversations || 0).toLocaleString("vi-VN")}</h3>
              <p className="text-xs text-muted-foreground">Tổng số hộp thoại chat</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
              <Users className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Message Reactions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Biểu cảm thả tin</p>
              <h3 className="text-3xl font-extrabold text-foreground">{(summary.totalReactions || 0).toLocaleString("vi-VN")}</h3>
              <p className="text-xs text-muted-foreground">Lượt tương tác cảm xúc</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
              <Smile className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Average Messages per Day */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tốc độ trao đổi</p>
              <h3 className="text-3xl font-extrabold text-foreground">
                {chart.length > 0 ? (chart.reduce((acc, curr) => acc + curr.count, 0) / chart.length).toFixed(0) : 0}
              </h3>
              <p className="text-xs text-muted-foreground">Tin nhắn / ngày (chu kỳ)</p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <Clock className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Card */}
      <Card>
        <CardHeader className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pb-2 border-b border-border/50">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="size-4 text-indigo-500" />
              Tần suất nhắn tin hàng ngày
            </CardTitle>
            <CardDescription>Biến động tổng lượng tin nhắn gửi trên mạng xã hội</CardDescription>
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
              <div className="text-center w-full text-muted-foreground text-xs pt-20">Chưa có dữ liệu thống kê tin nhắn</div>
            ) : (
              <ChartContainer 
                config={{ 
                  count: { label: "Số lượng tin nhắn", color: "#6366f1" } 
                }} 
                className="h-full w-full"
              >
                <AreaChart data={chart} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
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
                    fill="url(#msgGrad)" 
                    stroke="#6366f1" 
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

      {/* Grid: Top Chatters and Emojis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Chatters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-600">
              <Award className="size-4" />
              Nhắn tin nhiều nhất (Top 5)
            </CardTitle>
            <CardDescription>Người dùng tích cực gửi tin nhắn nhất trên hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!leaderboards?.topChatters || leaderboards.topChatters.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Chưa có dữ liệu người dùng nhắn tin</p>
            ) : (
              leaderboards.topChatters.map((userObj, index) => (
                <div key={userObj._id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                    <Avatar className="size-8">
                      <AvatarImage src={userObj.userInfo?.profile_picture} />
                      <AvatarFallback className="text-[10px]">{userObj.userInfo?.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-semibold">{userObj.userInfo?.full_name}</div>
                      <div className="text-[10px] text-muted-foreground">@{userObj.userInfo?.username}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                    {userObj.count} tin
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top message reactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-pink-600">
              <Award className="size-4" />
              Biểu cảm tin nhắn phổ biến
            </CardTitle>
            <CardDescription>Các emoji phản hồi được sử dụng nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!leaderboards?.topReactions || leaderboards.topReactions.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Chưa có biểu cảm nào được sử dụng</p>
            ) : (
              leaderboards.topReactions.map((reaction, index) => (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{index + 1}</span>
                    <span className="text-2xl">{reaction._id}</span>
                  </div>
                  <span className="text-xs font-bold bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 px-2.5 py-0.5 rounded-full">
                    {reaction.count} lượt
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageStats;
