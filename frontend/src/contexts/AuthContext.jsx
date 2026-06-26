import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, logout as logoutService } from "../services/AuthServices";

import { updateToken } from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userCurrent, setUserCurrent] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
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

  return (
    <AuthContext.Provider
      value={{
        userCurrent,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
