import { createContext, useContext, useState } from "react";
import { getToken } from "../lib/axios";
import { io } from "socket.io-client";

const SocketContext = createContext();

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [systemModal, setSystemModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
    size: "md",
    image: "",
    showCloseButton: true,
    primaryAction: null,
    secondaryAction: null,
    onClose: null,
  });

  const connectSocket = () => {
    const accessToken = getToken();
    if (!accessToken) {
      console.log("Không tìm thấy accessToken để connect socket");
      return;
    }

    setSocket((prevSocket) => {
      if (prevSocket) {
        return prevSocket;
      }

      const newSocket = io(baseURL, {
        auth: { token: accessToken },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Đã kết nối với Socket:", newSocket.id);
      });

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("account:lock", (data) => {
        const notification = data?.notification;
        setSystemModal({
          open: true,
          title: "Tài khoản bị khóa",
          message: notification?.content || "Tài khoản của bạn đã bị khóa! Nếu có sai sót vui lòng liên hệ Admin.",
          type: "lock",
          size: "md",
          showCloseButton: false,
          primaryAction: {
            label: "Xác nhận & Đăng xuất",
            onClick: () => {
              localStorage.removeItem("accessToken");
              window.location.href = "/login";
            },
          },
        });
      });

      return newSocket;
    });
  };

  const disconnectSocket = () => {
    setSocket((prevSocket) => {
      if (prevSocket) {
        prevSocket.disconnect();
      }
      return null;
    });
    setOnlineUsers([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connectSocket,
        disconnectSocket,

        onlineUsers,

        systemModal,
        setSystemModal,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
