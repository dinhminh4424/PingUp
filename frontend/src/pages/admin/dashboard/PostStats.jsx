import React, { useEffect, useState } from "react";
import { getPostStats } from "../../../services/admin/StatsService";
import {
  FileText,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Tv,
  Eye,
  Calendar,
  MessageCircle,
  MessagesSquare,
  Activity,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const PostStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState("7days"); // '7days' | '30days' | 'custom'
  const [postTypeFilter, setPostTypeFilter] = useState("all");
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
        const res = await getPostStats(chartPeriod, postTypeFilter, start, end);
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu thống kê bài viết");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [chartPeriod, postTypeFilter, startDate, endDate]);

  if (loading && !data) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Thống kê Bài viết & Hoạt động</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="h-28 flex items-center">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const { posts, stories, messages, comments, chart, leaderboards } = data;
  const maxActivityCount = Math.max(
    ...chart.map((d) => Math.max(d.posts, d.comments, d.messages)),
    5,
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Thống kê Bài viết & Hoạt động
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Giám sát nội dung, story và mức độ tương tác, nhắn tin của người
            dùng.
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

      {/* Grid of stats */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
          <FileText className="size-5" />
          Tương tác & Bài viết
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-sm transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Tổng số bài viết
              </CardTitle>
              <FileText className="size-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.totalPosts.toLocaleString("vi-VN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="size-3 text-indigo-500" />
                <span>{posts.postsToday} bài tạo hôm nay</span>
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Lượt tương tác (Likes & Comments)
              </CardTitle>
              <Heart className="size-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(posts.totalLikes + posts.totalComments).toLocaleString(
                  "vi-VN",
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Thích: {posts.totalLikes.toLocaleString("vi-VN")} | Bình luận:{" "}
                {posts.totalComments.toLocaleString("vi-VN")}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Chia sẻ & Ẩn/Xóa
              </CardTitle>
              <Share2 className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.totalShares.toLocaleString("vi-VN")}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-red-500">
                <Trash2 className="size-3" />
                <span>{posts.deletedOrHiddenPosts} bài bị ẩn hoặc xóa</span>
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-sm transition">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Bình luận & Thích
              </CardTitle>
              <MessageSquare className="size-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comments?.totalComments?.toLocaleString("vi-VN") || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lượt thích bình luận:{" "}
                {comments?.totalCommentLikes?.toLocaleString("vi-VN") || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activity Chart Section */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="size-4 text-blue-500" />
              Biểu đồ hoạt động chi tiết
            </CardTitle>
            <CardDescription>
              Biến động tần suất sử dụng tính năng theo thời gian
            </CardDescription>
          </div>
          {/* Filters and Chart Period Switcher */}
          <div className="flex flex-wrap items-center gap-3 relative z-20">
            {/* Post Type Filter */}
            <select
              value={postTypeFilter}
              onChange={(e) => setPostTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground shadow-sm focus:outline-hidden"
            >
              <option value="all">Tất cả loại bài viết</option>
              <option value="text">Chỉ chữ (text)</option>
              <option value="image">Hình ảnh (image)</option>
              <option value="text_with_image">
                Chữ kèm ảnh (text_with_image)
              </option>
              <option value="share">Chia sẻ (share)</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="h-[280px] pt-4 pb-2 relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/40 flex items-center justify-center z-10 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {/* Shadcn / Recharts Line Chart */}
          <div className="h-full w-full">
            {!chart || chart.length === 0 ? (
              <div className="text-center w-full text-muted-foreground text-xs pt-20">
                Chưa có dữ liệu thống kê hoạt động
              </div>
            ) : (
              <ChartContainer
                config={{
                  posts: { label: "Bài viết", color: "#6366f1" },
                  comments: { label: "Bình luận", color: "#ec4899" },
                }}
                className="h-full w-full"
              >
                <LineChart
                  data={chart}
                  margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                >
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
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    name="posts"
                    dataKey="posts"
                    type="monotone"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    name="comments"
                    dataKey="comments"
                    type="monotone"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Type Breakdown Card */}
      <Card className="mt-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600">
            <Award className="size-4" />
            Thống kê Loại bài viết (post_type)
          </CardTitle>
          <CardDescription>
            Phân loại định dạng nội dung người dùng đăng tải
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-4">
          {["text", "image", "text_with_image", "share"].map((type) => {
            const match = leaderboards?.postTypesBreakdown?.find(
              (item) => item._id === type,
            );
            const count = match ? match.count : 0;
            const maxCount = Math.max(
              ...(leaderboards?.postTypesBreakdown?.map(
                (item) => item.count,
              ) || [1]),
            );

            const labels = {
              text: "Bài viết chỉ chữ",
              image: "Bài viết hình ảnh",
              text_with_image: "Chữ kèm hình ảnh",
              share: "Bài đăng chia sẻ",
            };

            return (
              <div
                key={type}
                className="flex flex-col gap-1.5 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {labels[type]}
                </span>
                <span className="text-2xl font-extrabold text-foreground">
                  {count}
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / (maxCount || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Grid of leaderboards */}
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        {/* Top Posts (Likes) */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <Award className="size-4" />
              Bài Viết Hot Nhất (Likes)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!leaderboards?.topPosts || leaderboards.topPosts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              leaderboards.topPosts.map((postObj, index) => (
                <div
                  key={postObj._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="size-8">
                      <AvatarImage src={postObj.userInfo?.profile_picture} />
                      <AvatarFallback className="text-[10px]">
                        {postObj.userInfo?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[120px] truncate">
                      <div className="text-xs font-semibold">
                        {postObj.content || "[Hình ảnh/Bài chia sẻ]"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{postObj.userInfo?.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full">
                    {postObj.likesCount} thích
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Commented Posts */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-600">
              <Award className="size-4" />
              Thảo luận nhiều nhất (Comments)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!leaderboards?.topCommentedPosts ||
            leaderboards.topCommentedPosts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              leaderboards.topCommentedPosts.map((postObj, index) => (
                <div
                  key={postObj._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="size-8">
                      <AvatarImage src={postObj.userInfo?.profile_picture} />
                      <AvatarFallback className="text-[10px]">
                        {postObj.userInfo?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[120px] truncate">
                      <div className="text-xs font-semibold">
                        {postObj.postInfo?.content || "[Hình ảnh/Bài chia sẻ]"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{postObj.userInfo?.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full">
                    {postObj.commentCount} bình luận
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Shared Posts */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600">
              <Award className="size-4" />
              Chia sẻ nhiều nhất (Shares)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!leaderboards?.topSharedPosts ||
            leaderboards.topSharedPosts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              leaderboards.topSharedPosts.map((postObj, index) => (
                <div
                  key={postObj._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="size-8">
                      <AvatarImage src={postObj.userInfo?.profile_picture} />
                      <AvatarFallback className="text-[10px]">
                        {postObj.userInfo?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[120px] truncate">
                      <div className="text-xs font-semibold">
                        {postObj.content || "[Hình ảnh/Bài chia sẻ]"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{postObj.userInfo?.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                    {postObj.shares_count} chia sẻ
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

export default PostStats;
