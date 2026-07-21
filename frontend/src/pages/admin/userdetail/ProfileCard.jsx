import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, MapPin, Calendar, Activity, Shield, User } from "lucide-react";

const ProfileCard = ({ user, getInitials, formatDate }) => {
  return (
    <Card className="md:col-span-1 border-border shadow-md hover:shadow-lg transition-all duration-300 h-fit overflow-hidden bg-card pt-0">
      {/* Decorative gradient banner */}
      <div className="h-40 bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="absolute bottom-2 right-3 text-[10px] text-white/50 font-mono tracking-wider select-none uppercase">
          PingUp Member Profile
        </div>
        {user.cover_photo && (
          <img src={user.cover_photo} className="w-full h-full object-cover" alt="cover" />
        )}
      </div>

      <CardContent className="pt-0 pb-7 px-6 relative flex flex-col items-center">
        {/* Avatar with thick ring and status dot */}
        <div className="relative -mt-16 z-10 w-24 h-24">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl hover:scale-105 transition-transform duration-300">
            <AvatarImage src={user.profile_picture} className="object-cover" />
            <AvatarFallback className="bg-linear-to-br from-violet-500 to-indigo-600 text-white text-2xl font-bold">
              {getInitials(user.full_name || user.username)}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background shadow-md ${
            user.activeOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/60"
          }`} />
        </div>

        {/* User identification */}
        <div className="text-center mt-3 w-full">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground truncate">{user.full_name}</h2>
          <p className="text-sm font-medium text-muted-foreground">@{user.username}</p>
          
          <div className="flex gap-2 justify-center mt-3">
            {user.role === "admin" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
                <Shield className="size-3" />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 shadow-xs">
                <User className="size-3" />
                User
              </span>
            )}
            
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs ${
              user.isActive 
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}>
              <span className={`size-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
              {user.isActive ? "Hoạt động" : "Bị khóa"}
            </span>
          </div>
        </div>

        {/* Biography */}
        {user.bio && (
          <p className="text-sm text-center mt-5 text-muted-foreground/80 italic font-medium leading-relaxed px-4 max-w-xs">
            "{user.bio}"
          </p>
        )}

        {/* Informational list */}
        <div className="w-full border-t border-border/60 mt-6 pt-6 space-y-4 text-sm font-medium text-muted-foreground">
          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Mail className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Địa chỉ Email</span>
              <span className="text-foreground text-sm truncate font-semibold">{user.email}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <MapPin className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Vị trí</span>
              <span className="text-foreground text-sm font-semibold">{user.location || "Chưa thiết lập"}</span>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Calendar className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Ngày đăng ký</span>
              <span className="text-foreground text-sm font-semibold">{formatDate(user.createdAt)}</span>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${user.activeOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>
              <Activity className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">Kết nối hiện tại</span>
              <span className={`text-sm font-bold ${user.activeOnline ? "text-emerald-500" : "text-muted-foreground"}`}>
                {user.activeOnline ? "Trực tuyến (Online)" : "Ngoại tuyến (Offline)"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
