import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  toggleUserActive,
  toggleUserRole,
} from "../../services/admin/UserService";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import UserStatsCards from "./usermanagement/UserStatsCards";
import UserTable from "./usermanagement/UserTable";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    adminUsers: 0,
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getUsers(
        debouncedSearchQuery,
        roleFilter,
        statusFilter,
        page
      );
      if (result.success) {
        setUsers(result.users);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 1);
          setTotalUsersCount(result.pagination.totalUsers || 0);
        }
        if (result.stats) {
          setStats(result.stats);
        }
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách"
      );
      toast.error(
        error.response?.data?.message || "Lỗi tải dữ liệu người dùng!"
      );
      console.error("Lỗi: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearchQuery, roleFilter, statusFilter, page]);

  const handleToggleActive = async (userId) => {
    try {
      const result = await toggleUserActive(userId);
      if (result.success) {
        toast.success(result.message);

        // Cập nhật state users cục bộ
        setUsers((prevUsers) => {
          const updated = prevUsers.map((user) =>
            user._id === userId ? { ...user, isActive: result.user.isActive } : user
          );
          if (statusFilter === "active" && !result.user.isActive) {
            return updated.filter((user) => user._id !== userId);
          }
          if (statusFilter === "blocked" && result.user.isActive) {
            return updated.filter((user) => user._id !== userId);
          }
          return updated;
        });

        // Cập nhật stats cục bộ
        setStats((prevStats) => {
          const isNowActive = result.user.isActive;
          return {
            ...prevStats,
            activeUsers: prevStats.activeUsers + (isNowActive ? 1 : -1),
          };
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

        // Cập nhật state users cục bộ
        setUsers((prevUsers) => {
          const updated = prevUsers.map((user) =>
            user._id === userId ? { ...user, role: result.user.role } : user
          );
          if (roleFilter === "user" && result.user.role === "admin") {
            return updated.filter((user) => user._id !== userId);
          }
          if (roleFilter === "admin" && result.user.role === "user") {
            return updated.filter((user) => user._id !== userId);
          }
          return updated;
        });

        // Cập nhật stats cục bộ
        setStats((prevStats) => {
          const isNowAdmin = result.user.role === "admin";
          return {
            ...prevStats,
            adminUsers: prevStats.adminUsers + (isNowAdmin ? 1 : -1),
          };
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật vai trò!");
    }
  };

  const handleViewDetails = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem danh sách, cập nhật trạng thái và thay đổi quyền hạn của các tài
            khoản.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && <p className="text-red-600 font-medium">{error}</p>}

      {/* Stats Cards */}
      <UserStatsCards stats={stats} loading={loading} />

      {/* Table Card */}
      <UserTable
        users={users}
        loading={loading}
        totalUsersCount={totalUsersCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        handleToggleActive={handleToggleActive}
        handleToggleRole={handleToggleRole}
        handleViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default UserManagement;
