import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { useSocket } from "./contexts/SocketContext";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import { useEffect } from "react";

import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";

const App = () => {
  const { userCurrent } = useAuth();
  const { connectSocket, disconnectSocket } = useSocket();

  useEffect(() => {
    if (userCurrent) {
      connectSocket();
    }

    return () => disconnectSocket();
  }, [userCurrent]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/maintenance" element={<Maintenance />} />
        
        {/* Route dành riêng cho Admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Tuyến đường chính cho người dùng thường */}
        <Route path="/*" element={!userCurrent ? <Login /> : <UserRoutes />} />
      </Routes>
    </>
  );
};

export default App;
