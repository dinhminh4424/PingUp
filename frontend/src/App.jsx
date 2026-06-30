import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import Layout from "./pages/layout/Layout";
import CreatePost from "./pages/CreatePost";

import { Toaster } from "react-hot-toast";
import { useAuth } from "./contexts/AuthContext";
import { useSocket } from "./contexts/SocketContext";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

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
        <Route path="/" element={!userCurrent ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:id" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
        <Route path="/register" element={<Register />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
