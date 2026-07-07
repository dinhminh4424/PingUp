import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "../pages/layout/UserLayout";
import Feed from "../pages/user/Feed";
import Messages from "../pages/user/Messages";
import ChatBox from "../pages/user/ChatBox";
import Connections from "../pages/user/Connections";
import Discover from "../pages/user/Discover";
import Profile from "../pages/user/Profile";
import CreatePost from "../pages/user/CreatePost";
import Notification from "../pages/user/Notification";
import PostDetail from "../pages/user/PostDetail";
import NotFound from "../pages/NotFound";

const UserRoutes = () => {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<Feed />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<ChatBox />} />
        <Route path="connections" element={<Connections />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:profileId" element={<Profile />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="notification" element={<Notification />} />
        <Route path="post/:postId" element={<PostDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default UserRoutes;
