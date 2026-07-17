import React, { useEffect, useState } from "react";
import { getStoryStats } from "../../../services/admin/StatsService";
import {
  Tv,
  Clock,
  Eye,
  Heart,
  Calendar,
  Award,
  Video,
  Image,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StoryStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' | '30days' | 'custom'
  const [storyTypeFilter, setStoryTypeFilter] = useState("all");

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const start = chartPeriod === "custom" ? startDate : null;
        const end = chartPeriod === "custom" ? endDate : null;
        const res = await getStoryStats(
          chartPeriod,
          storyTypeFilter,
          start,
          end,
        );
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu thống kê story");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [chartPeriod, storyTypeFilter, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Thống kê Story</h1>
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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Thống kê Story
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Phân tích số liệu đăng tải, định dạng và lượt xem story của người
            dùng
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
        {/* Total Stories */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tổng số Story
              </p>
              <h3 className="text-3xl font-extrabold text-foreground">
                {summary.totalStories || 0}
              </h3>
              <p className="text-xs text-pink-500 font-medium">
                +{summary.storiesToday || 0} hôm nay
              </p>
            </div>
            <div className="p-3 bg-pink-100 dark:bg-pink-900/50 rounded-xl text-pink-600 dark:text-pink-400">
              <Tv className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Story Views */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tổng lượt xem
              </p>
              <h3 className="text-3xl font-extrabold text-foreground">
                {(summary.totalStoryViews || 0).toLocaleString("vi-VN")}
              </h3>
              <p className="text-xs text-muted-foreground">
                Người xem tích lũy
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl text-blue-600 dark:text-blue-400">
              <Eye className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Story Likes */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Tổng lượt thích
              </p>
              <h3 className="text-3xl font-extrabold text-foreground">
                {(summary.totalStoryLikes || 0).toLocaleString("vi-VN")}
              </h3>
              <p className="text-xs text-muted-foreground">
                Reactions trên story
              </p>
            </div>
            <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400">
              <Heart className="size-6" />
            </div>
          </CardContent>
        </Card>

        {/* Average Views per Story */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Lượt xem trung bình
              </p>
              <h3 className="text-3xl font-extrabold text-foreground">
                {summary.totalStories > 0
                  ? (summary.totalStoryViews / summary.totalStories).toFixed(1)
                  : 0}
              </h3>
              <p className="text-xs text-muted-foreground">Lượt xem / story</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-xl text-teal-600 dark:text-teal-400">
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
              <Tv className="size-4 text-pink-500" />
              Tần suất tạo Story mới
            </CardTitle>
            <CardDescription>
              Biến động lượng story đăng tải hàng ngày
            </CardDescription>
          </div>
          {/* Advanced Filtering controls */}
          <div className="flex flex-wrap items-center gap-3 relative z-20">
            {/* Format Filter */}
            <select
              value={storyTypeFilter}
              onChange={(e) => setStoryTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="text">Chỉ chữ (text)</option>
              <option value="image">Chỉ ảnh (image)</option>
              <option value="video">Video</option>
              <option value="text_with_image">Chữ kèm ảnh</option>
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
            {!chart || chart.length === 0 ? (
              <div className="text-center w-full text-muted-foreground text-xs pt-20">
                Chưa có dữ liệu thống kê story
              </div>
            ) : (
              <ChartContainer
                config={{
                  count: { label: "Story đăng tải", color: "#ec4899" },
                }}
                className="h-full w-full"
              >
                <AreaChart
                  data={chart}
                  margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="storyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value, index) => {
                      if (
                        chartPeriod === "30days" &&
                        index % 4 !== 0 &&
                        index !== chart.length - 1
                      )
                        return "";
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
                    fill="url(#storyGrad)"
                    stroke="#ec4899"
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

      {/* Leaderboard: Top Viewed Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <Award className="size-4 text-amber-500" />
            Top 5 Stories xem nhiều nhất
          </CardTitle>
          <CardDescription>
            Stories thu hút nhiều lượt theo dõi nhất từ bạn bè
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboards?.topStories || leaderboards.topStories.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Chưa có dữ liệu stories xem nhiều
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="pb-3 font-semibold">Tác giả</th>
                    <th className="pb-3 font-semibold">Nội dung</th>
                    <th className="pb-3 font-semibold text-right">Lượt xem</th>
                    <th className="pb-3 font-semibold text-right">Ngày đăng</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboards.topStories.map((story) => (
                    <tr
                      key={story._id}
                      className="border-b border-border/40 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={story.userInfo?.profile_picture} />
                          <AvatarFallback className="text-[10px]">
                            {story.userInfo?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground leading-none">
                            {story.userInfo?.full_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            @{story.userInfo?.username}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground max-w-[200px] truncate">
                        {story.content || "[Hình ảnh/Video]"}
                      </td>
                      <td className="py-3 text-right font-bold text-pink-600 dark:text-pink-400">
                        {story.viewersCount} lượt
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {new Date(story.createdAt).toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "numeric",
                        })}
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
  );
};

export default StoryStats;
