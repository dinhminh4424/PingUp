import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, UserCheck, Heart, ShieldAlert } from "lucide-react";

const StatsGrid = ({ stats }) => {
  const items = [
    {
      label: "Bài viết",
      value: stats.postsCount,
      icon: FileText,
      colorClass: "text-violet-500",
      bgClass: "bg-violet-500/10",
      borderClass: "border-violet-500/20",
    },
    {
      label: "Người theo dõi",
      value: stats.followersCount,
      icon: Users,
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
    },
    {
      label: "Đang theo dõi",
      value: stats.followingCount,
      icon: UserCheck,
      colorClass: "text-sky-500",
      bgClass: "bg-sky-500/10",
      borderClass: "border-sky-500/20",
    },
    {
      label: "Bạn bè (Kết nối)",
      value: stats.connectionsCount,
      icon: Heart,
      colorClass: "text-indigo-500",
      bgClass: "bg-indigo-500/10",
      borderClass: "border-indigo-500/20",
    },
    {
      label: "Bị báo cáo",
      value: stats.reportsCount,
      icon: ShieldAlert,
      colorClass: "text-rose-500",
      bgClass: "bg-rose-500/10",
      borderClass: "border-rose-500/30",
      isHighlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card 
            key={idx} 
            className={`border shadow-xs hover:-translate-y-1 transition-all duration-300 ${item.borderClass} ${
              item.isHighlight ? "bg-rose-500/5 dark:bg-rose-950/15" : "bg-card"
            }`}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className={`p-2.5 rounded-xl ${item.bgClass} ${item.colorClass} mb-2.5`}>
                <Icon className="size-5" />
              </div>
              <div className="text-2xl font-extrabold text-foreground tracking-tight">
                {item.value}
              </div>
              <div className="text-xs font-semibold text-muted-foreground mt-1">
                {item.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;
