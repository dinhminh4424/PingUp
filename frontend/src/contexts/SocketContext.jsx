import { createContext, useContext, useState } from "react";
import { getToken } from "../lib/axios";
import { io } from "socket.io-client";

const SocketContext = createContext();

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
