import React, { useEffect, useState } from "react";
import { getSuspiciousActivities } from "../../../services/admin/ActivityLogService";
import { toggleUserActive } from "../../../services/admin/UserService";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Ban, Check, ShieldCheck, RefreshCw, Clock } from "lucide-react";
import toast from "react-hot-toast";

const ActivityLogAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getSuspiciousActivities();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách cảnh báo bảo mật!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleToggleActive = async (userId) => {
    try {
      const result = await toggleUserActive(userId);
      if (result.success) {
        toast.success(result.message);
        // Cập nhật trạng thái người dùng trong state cảnh báo
        setAlerts((prev) =>
          prev.map((alert) => {
            if (alert.user && alert.user._id === userId) {
              return {
                ...alert,
                user: { ...alert.user, isActive: result.user.isActive },
              };
            }
            return alert;
          })
        );
      }
    } catch (error) {
      toast.error("Lỗi khi thay đổi trạng thái hoạt động!");
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header filter bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldAlert className="size-4 text-rose-500" /> Cảnh báo bảo mật hệ thống
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAlerts}
          disabled={loading}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          Quét lại
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-sm text-muted-foreground font-semibold animate-pulse">
          Hệ thống đang quét các mối đe dọa bảo mật...
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 p-8 text-center flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="size-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">Hệ thống hoàn toàn an toàn</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Không phát hiện bất kỳ hoạt động đăng nhập đáng ngờ (brute force) hoặc hành vi spam tương tác nào trong thời gian gần đây.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => {
            const isHigh = alert.severity === "HIGH";
            const user = alert.user || {};
            const hasUser = user._id;

            return (
              <Card
                key={alert._id}
                className={`border shadow-xs bg-card transition-all hover:shadow-sm ${
                  isHigh ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/5" : "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/5"
                }`}
              >
                <CardContent className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    {/* Severity alert badge icon */}
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        isHigh ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      <ShieldAlert className="size-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className="text-sm font-bold text-foreground">{alert.title}</h4>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${
                            isHigh
                              ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                              : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                          }`}
                        >
                          {isHigh ? "Nguy hiểm (High)" : "Cảnh báo (Medium)"}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed font-semibold">{alert.description}</p>
                      
                      {/* Sub metadata details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-semibold pt-1">
                        {alert.metadata?.ips && (
                          <span>IP phát sinh: {alert.metadata.ips.join(", ")}</span>
                        )}
                        {alert.metadata?.actions && (
                          <span>Hành vi: {alert.metadata.actions.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button for Admin */}
                  {hasUser && (
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end border-border/40">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7 border">
                          <AvatarImage src={user.profile_picture} className="object-cover" />
                          <AvatarFallback className="text-[9px] font-bold">
                            {getInitials(user.full_name || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-semibold text-muted-foreground truncate max-w-[120px]">
                          {user.full_name || `@${user.username}`}
                        </span>
                      </div>

                      {user.role === "admin" ? (
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                          Admin
                        </span>
                      ) : (
                        <Button
                          variant={user.isActive !== false ? "destructive" : "default"}
                          size="xs"
                          onClick={() => handleToggleActive(user._id)}
                          className="gap-1 cursor-pointer font-bold py-1 h-8 text-[11px]"
                        >
                          {user.isActive !== false ? (
                            <>
                              <Ban className="size-3" /> Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Check className="size-3" /> Mở khóa
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityLogAlerts;
