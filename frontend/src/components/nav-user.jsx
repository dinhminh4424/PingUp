"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { logout } from "@/services/AuthServices"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ChevronsUpDown,
  Sparkles,
  BadgeCheck,
  LogOut,
} from "lucide-react"

export function NavUser() {
  const { logout: logoutAuth, userCurrent } = useAuth()
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const res = await logout()
      if (!res.success) {
        console.log("Lỗi đăng xuất")
      }
      await logoutAuth()
      window.location.href = "/"
    } catch (error) {
      console.log("Lỗi đăng xuất: ", error)
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={userCurrent?.profile_picture || "/default-avatar.avif"} alt={userCurrent?.full_name || "Admin"} />
              <AvatarFallback className="rounded-lg">AD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{userCurrent?.full_name || "Admin User"}</span>
              <span className="truncate text-xs text-muted-foreground">@{userCurrent?.username || "admin"}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userCurrent?.profile_picture || "/default-avatar.avif"} alt={userCurrent?.full_name || "Admin"} />
                    <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userCurrent?.full_name || "Admin User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{userCurrent?.email || "admin@pingup.com"}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/")}>
                <Sparkles className="size-4 mr-2" />
                Về trang chủ
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <BadgeCheck className="size-4 mr-2" />
                Cài đặt
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4 mr-2" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
