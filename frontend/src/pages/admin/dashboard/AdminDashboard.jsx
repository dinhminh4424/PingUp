import React, { useEffect, useState } from "react";
import { getOverviewStats } from "../../../services/admin/StatsService";
import {
  Users,
  MessageSquare,
  FileText,
  Activity,
  Heart,
  Eye,
  TrendingUp,
  Award,
  Zap,
  MessageCircle,
  Tv,
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getOverviewStats();
        if (res.success) {
          setData(res);
        } else {
          setError(res.message || "Không thể lấy số liệu tổng quan");
        }
      } catch (err) {
        setError(err.message || "Lỗi kết nối server");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Tổng quan Hệ thống
            </h1>
            <p className="text-muted-foreground">
              Đang tải dữ liệu thời gian thực...
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[150px]" />
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-red-600 dark:text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  const { stats, leaderboards } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tổng quan Hệ thống
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Theo dõi hiệu suất hoạt động và các chỉ số tổng quát thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/30 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          {stats.onlineUsers} người dùng trực tuyến
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card className="hover:shadow-md transition duration-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng người dùng
            </CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lượng tài khoản đã đăng ký
            </p>
          </CardContent>
        </Card>

        {/* Total Posts */}
        <Card className="hover:shadow-md transition duration-200 border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng bài viết
            </CardTitle>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPosts.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="size-3 text-amber-500" />
              <span>+{stats.postsToday} bài viết hôm nay</span>
            </p>
          </CardContent>
        </Card>

        {/* Messages sent */}
        <Card className="hover:shadow-md transition duration-200 border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tin nhắn gửi đi
            </CardTitle>
            <div className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
              <MessageSquare className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalMessages.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MessageCircle className="size-3 text-violet-500" />
              <span>+{stats.messagesToday} tin nhắn hôm nay</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Likes */}
        <Card className="hover:shadow-md transition duration-200 border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng lượt thích
            </CardTitle>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <Heart className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLikes.toLocaleString("vi-VN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Tv className="size-3 text-pink-500" />
              <span>{stats.totalStories} Stories chia sẻ</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Leaderboards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Posters */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-600">
              <Award className="size-4" />
              Top Đăng Bài Nhiều Nhất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboards.topPosters.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              leaderboards.topPosters.map((userObj, index) => (
                <div
                  key={userObj._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="size-8">
                      <AvatarImage src={userObj.userInfo.profile_picture} />
                      <AvatarFallback className="text-[10px]">
                        {userObj.userInfo.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-semibold">
                        {userObj.userInfo.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{userObj.userInfo.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full">
                    {userObj.count} bài
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Liked */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-500">
              <Heart className="size-4" />
              Nhận Nhiều Like Nhất
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboards.topLiked.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              leaderboards.topLiked.map((userObj, index) => (
                <div
                  key={userObj._id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <Avatar className="size-8">
                      <AvatarImage src={userObj.userInfo.profile_picture} />
                      <AvatarFallback className="text-[10px]">
                        {userObj.userInfo.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-xs font-semibold">
                        {userObj.userInfo.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        @{userObj.userInfo.username}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full">
                    {userObj.count} likes
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

export default AdminDashboard;
