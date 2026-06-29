import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  UserCheck,
  UserPlus,
  UserRoundPen,
  Users,
  UserX,
  UserMinus,
} from "lucide-react";
import { getFollower, getFollowing } from "../services/FollowServices";
import {
  getPendingRequests,
  getConnectionsList,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectConnection,
  toggleFollow,
} from "../services/ConnectionServices";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Connections = () => {
  const navigate = useNavigate();

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
  ];

  const [currentTab, setCurrentTab] = useState(dataArray[0].label);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [followerResult, followingResult, pendingResult, connectionsResult] = await Promise.all([
        getFollower(),
        getFollowing(),
        getPendingRequests(),
        getConnectionsList(),
      ]);

      setFollowers(followerResult.followers || []);
      setFollowing(followingResult.following || []);
      setPendingConnections(pendingResult.requests || []);
      setConnections(connectionsResult.connections || []);
    } catch (err) {
      console.log("LỖI: ", err);
      setError("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnfollow = async (targetUserId) => {
    try {
      const res = await toggleFollow(targetUserId);
      if (res.success) {
        toast.success(res.message || "Đã hủy theo dõi");
        setFollowing((prev) => prev.filter((u) => u._id !== targetUserId));
      }
    } catch (err) {
      toast.error("Không thể hủy theo dõi");
    }
  };

  const handleAccept = async (user) => {
    try {
      if (user.requestId) {
        const res = await acceptConnectionRequest(user.requestId);
        if (res.success) {
          toast.success("Đã đồng ý kết bạn");
          setPendingConnections((prev) => prev.filter((u) => u._id !== user._id));
          setConnections((prev) => [...prev, user]);
          // Tự động thêm vào following
          if (!following.some((u) => u._id === user._id)) {
            setFollowing((prev) => [...prev, user]);
          }
        }
      }
    } catch (err) {
      toast.error("Đồng ý kết bạn thất bại");
    }
  };

  const handleDecline = async (user) => {
    try {
      if (user.requestId) {
        const res = await rejectConnectionRequest(user.requestId);
        if (res.success) {
          toast.success("Đã từ chối lời mời kết bạn");
          setPendingConnections((prev) => prev.filter((u) => u._id !== user._id));
        }
      }
    } catch (err) {
      toast.error("Từ chối lời mời thất bại");
    }
  };

  const handleDisconnect = async (targetUserId) => {
    try {
      const res = await disconnectConnection(targetUserId);
      if (res.success) {
        toast.success("Đã hủy kết bạn");
        setConnections((prev) => prev.filter((u) => u._id !== targetUserId));
      }
    } catch (err) {
      toast.error("Hủy kết bạn thất bại");
    }
  };

  const currentTabItems = dataArray.find((item) => item.label === currentTab)?.value || [];

  return !isLoading ? (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* Count cards */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md cursor-pointer hover:bg-slate-50 transition"
                onClick={() => setCurrentTab(item.label)}
              >
                <b className="text-lg text-slate-800">{item.value.length}</b>
                <p className="text-slate-500 text-sm">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tabs navigation */}
        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm mb-6">
          {dataArray.map((tab) => {
            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`flex items-center px-4 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                  currentTab === tab.label
                    ? "bg-indigo-600 text-white font-medium shadow-sm"
                    : "text-gray-500 hover:text-black"
                } `}
              >
                <tab.icon className="w-4 h-4" />
                <span className="ml-1.5">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Connections List */}
        <div className="flex flex-wrap gap-6 mt-2">
          {currentTabItems.length > 0 ? (
            currentTabItems.map((user) => {
              return (
                <div
                  key={user._id}
                  className="w-full max-w-[340px] flex gap-4 p-5 bg-white shadow rounded-md border border-gray-100 hover:shadow-md transition"
                >
                  <img
                    src={user.profile_picture || "/default-avatar.png"}
                    alt=""
                    className="rounded-full w-12 h-12 shadow-md mx-auto"
                  />
                   <div className="flex-1">
                    <p className="font-medium text-slate-700">
                      {user.full_name}
                    </p>
                    <p className="text-slate-500">@{user.username}</p>
                    <p className="text-xs text-gray-600">
                      {user.bio.slice(0, 30)}...
                    </p>

                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/profile/${user._id}`)}
                        className="w-full p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer "
                      >
                        View Profile
                      </button>

                      {currentTab === "Following" && (
                        <button
                          onClick={() => handleUnfollow(user._id)}
                          className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 active:scale-95 transition cursor-pointer "
                        >
                          Unfollow
                        </button>
                      )}

                      {currentTab === "Pending" && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleAccept(user)}
                            className="w-1/2 p-2 text-sm rounded bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 transition cursor-pointer font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(user)}
                            className="w-1/2 p-2 text-sm rounded bg-red-50 hover:bg-red-100 text-red-600 active:scale-95 transition cursor-pointer font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {currentTab === "Connections" && (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => navigate(`/messages/${user._id}`)}
                            className="w-full p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer flex items-center justify-center gap-1 "
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat
                          </button>
                          <button
                            onClick={() => handleDisconnect(user._id)}
                            className="w-full p-2 text-sm rounded bg-red-50 hover:bg-red-100 hover:text-red-600 text-red-500 active:scale-95 transition cursor-pointer "
                          >
                            Disconnect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="w-full text-center py-12 bg-white rounded-md border border-dashed border-gray-200">
              <p className="text-gray-500">No users found in this tab.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Connections;
