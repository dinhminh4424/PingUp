import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getUserDetail,
  toggleUserActive,
  toggleUserRole,
} from "../../services/admin/UserService";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Shield,
  Ban,
  Check,
  ShieldAlert,
} from "lucide-react";

import ProfileCard from "./userdetail/ProfileCard";
import StatsGrid from "./userdetail/StatsGrid";
import DetailTabs from "./userdetail/DetailTabs";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState("overview");

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const result = await getUserDetail(id);
      if (result.success) {
        setUserDetail(result);
      } else {
        toast.error("Không thể tải thông tin chi tiết");
      }
    } catch (error) {
      toast.error("Lỗi khi tải thông tin người dùng!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleToggleActive = async (userId) => {
    try {
      const result = await toggleUserActive(userId);
      if (result.success) {
        toast.success(result.message);
        setUserDetail((prev) => {
          if (prev && prev.user._id === userId) {
            return {
              ...prev,
              user: { ...prev.user, isActive: result.user.isActive },
            };
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật trạng thái!"
      );
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const result = await toggleUserRole(userId);
      if (result.success) {
        toast.success(result.message);
        setUserDetail((prev) => {
          if (prev && prev.user._id === userId) {
            return {
              ...prev,
              user: { ...prev.user, role: result.user.role },
            };
          }
          return prev;
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật vai trò!");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="w-fit gap-2 -ml-2">
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-1">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <Skeleton className="size-24 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
              <div className="w-full border-t pt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!userDetail || !userDetail.user) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="w-fit gap-2 -ml-2">
          <ArrowLeft className="size-4" /> Quay lại
        </Button>
        <Card className="p-8 text-center flex flex-col items-center gap-3">
          <ShieldAlert className="size-12 text-rose-500" />
          <h2 className="text-xl font-bold">Không tìm thấy dữ liệu người dùng</h2>
          <p className="text-muted-foreground">Có lỗi xảy ra hoặc người dùng không tồn tại.</p>
        </Card>
      </div>
    );
  }

  const { user, stats, posts = [], conversations = [], reports = [] } = userDetail;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Navigation & Actions */}
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="gap-2 -ml-2">
          <ArrowLeft className="size-4" /> Danh sách người dùng
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleRole(user._id)}
            className="gap-1.5"
          >
            <Shield className="size-4 text-indigo-500" />
            {user.role === "admin" ? "Hạ quyền thành User" : "Thăng quyền Admin"}
          </Button>

          <Button
            variant={user.isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => handleToggleActive(user._id)}
            className="gap-1.5"
          >
            {user.isActive ? (
              <>
                <Ban className="size-4" /> Khóa tài khoản
              </>
            ) : (
              <>
                <Check className="size-4" /> Mở khóa tài khoản
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card Sidebar */}
        <ProfileCard user={user} getInitials={getInitials} formatDate={formatDate} />

        {/* Details Content Area */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Stats Grid Counters */}
          <StatsGrid stats={stats} />

          {/* Sub-tab Views */}
          <DetailTabs
            user={user}
            posts={posts}
            conversations={conversations}
            reports={reports}
            formatDate={formatDate}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
          />
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
