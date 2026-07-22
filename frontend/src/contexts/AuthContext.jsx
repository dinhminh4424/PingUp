import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  logout as logoutService,
} from "../services/AuthServices";
import { getPublicConfigs } from "../services/SystemConfigService";

import { updateToken } from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userCurrent, setUserCurrent] = useState(null);
  const [systemConfigs, setSystemConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshSystemConfigs = async () => {
    try {
      const res = await getPublicConfigs();
      if (res.success && res.data) {
        setSystemConfigs(res.data);
        
        // Tự động áp dụng tên trang web lên tiêu đề trình duyệt
        const siteName = res.data["system.site_name"];
        if (siteName) {
          document.title = siteName;
        }
        
        // Tự động áp dụng màu nền & hình nền toàn trang web lên body DOM
        const bgColor = res.data["system.bg_color"];
        const bgImage = res.data["system.bg_image_url"];
        
        if (bgColor) {
          document.body.style.backgroundColor = bgColor;
        }
        if (bgImage) {
          document.body.style.backgroundImage = `url(${bgImage})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
          document.body.style.backgroundAttachment = "fixed";
        } else {
          document.body.style.backgroundImage = "none";
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải cấu hình công khai:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Tải cấu hình hệ thống công khai trước
      await refreshSystemConfigs();

      try {
        const userData = await getCurrentUser();
        setUserCurrent(userData);
      } catch {
        setUserCurrent(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData, token) => {
    updateToken(token);
    setUserCurrent(userData);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Lỗi khi đăng xuất ở server:", error);
    } finally {
      updateToken(null);
      setUserCurrent(null);
    }
  };

  const updateCurrentUser = (updatedData) => {
    setUserCurrent((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        userCurrent,
        systemConfigs,
        refreshSystemConfigs,
        loading,
        login,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
