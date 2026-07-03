import {
  Calendar,
  MapPin,
  PenBox,
  Verified,
  UserPlus,
  UserCheck,
  UserMinus,
  UserX,
  Rss,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext";
import {
  getConnectionStatus,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectConnection,
  toggleFollow,
} from "../../services/ConnectionServices";
import toast from "react-hot-toast";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  const { userCurrent } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState("none"); // none, pending_sent, pending_received, connected
  const [requestId, setRequestId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (user) {
      setFollowersCount(user.followersCount || 0);
      setFollowingCount(user.followingCount || 0);
    }
  }, [user]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (profileId && profileId !== userCurrent._id) {
        try {
          const res = await getConnectionStatus(profileId);
          if (res.success) {
            setConnectionStatus(res.connectionStatus);
            setIsFollowing(res.isFollowing);
            setRequestId(res.requestId);
          }
        } catch (error) {
          console.error("Lỗi khi lấy trạng thái kết bạn: ", error);
        }
      }
    };
    fetchStatus();
  }, [profileId, userCurrent._id]);

  const handleFollow = async () => {
    try {
      setLoading(true);
      const res = await toggleFollow(profileId);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount((prev) =>
          res.isFollowing ? prev + 1 : Math.max(0, prev - 1),
        );
        toast.success(res.message);
      }
    } catch (error) {
      toast.error("Error: " + error.response?.data?.message || "Failed to follow");
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      if (connectionStatus === "none") {
        const res = await sendConnectionRequest({ receiver: profileId });
        if (res.success) {
          setConnectionStatus("pending_sent");
          setRequestId(res.request?._id || null);
          toast.success("Successfully sent friend request");
        } else {
          toast.error(res.message || "Failed to send friend request");
        }
      } else if (
        connectionStatus === "pending_sent" ||
        connectionStatus === "pending_received"
      ) {
        if (requestId) {
          const res = await rejectConnectionRequest(requestId);
          if (res.success) {
            setConnectionStatus("none");
            setRequestId(null);
            toast.success("Rejected/Cancelled friend request successfully");
          }
        }
      } else if (connectionStatus === "connected") {
        const res = await disconnectConnection(profileId);
        if (res.success) {
          setConnectionStatus("none");
          setRequestId(null);
          toast.success("Successfully disconnected from friend");
        }
      }
    } catch (error) {
      toast.error("Error: " + error.response?.data?.message || "Failed to connect");
      console.log("Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setLoading(true);
      if (requestId) {
        const res = await acceptConnectionRequest(requestId);
        if (res.success) {
          setConnectionStatus("connected");
          setIsFollowing(true);
          setFollowersCount((prev) => prev + 1);
          toast.success("Accepted friend request successfully");
        }
      }
    } catch (error) {
      toast.error("Error: " + error.response?.data?.message || "Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full overflow-hidden bg-gray-100">
          <img
            src={user.profile_picture || "/default-avatar.png"}
            className="w-full h-full object-cover rounded-full z-2"
            alt=""
          />
        </div>
        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <Verified className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-gray-500">
                {user.username ? `@${user.username}` : "Add a UserName"}
              </p>
            </div>

            {/* Tự xem trang cá nhân của mình */}
            {!profileId && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer text-gray-700"
              >
                <PenBox className="w-4 h-4" /> Edit
              </button>
            )}

            {/* Xem trang cá nhân người khác */}
            {profileId && profileId !== userCurrent._id && (
              <div className="flex items-center gap-3 mt-4 md:mt-0">
                {/* Nút Theo Dõi (Follow) */}
                <button
                  onClick={handleFollow}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm ${
                    isFollowing
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  <Rss className="w-4 h-4" />
                  {isFollowing ? "Following" : "Follow"}
                </button>

                {/* Nút Kết Bạn (Connection) */}
                {connectionStatus === "none" && (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-gray-700 text-sm"
                  >
                    <UserPlus className="w-4 h-4 text-gray-500" /> Connect
                  </button>
                )}

                {connectionStatus === "pending_sent" && (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center gap-2 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-orange-700 text-sm"
                  >
                    <UserMinus className="w-4 h-4 text-orange-500 animate-pulse" />{" "}
                    Requested (Cancel)
                  </button>
                )}

                {connectionStatus === "pending_received" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAcceptRequest}
                      disabled={loading}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm"
                    >
                      <UserCheck className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="flex items-center gap-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm"
                    >
                      <UserX className="w-4 h-4" /> Decline
                    </button>
                  </div>
                )}

                {connectionStatus === "connected" && (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="flex items-center gap-2 border border-indigo-200 bg-indigo-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-indigo-700 text-sm group"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-500 group-hover:hidden" />
                    <UserMinus className="w-4 h-4 text-red-500 hidden group-hover:block" />
                    <span className="group-hover:hidden">Connected</span>
                    <span className="hidden group-hover:inline">
                      Disconnect
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-700 text-sm max-w-md mt-4">{user.bio}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location ? user.location : "Add Location"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Joined
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
              <div>
                <span className="sm:text-xl font-bold text-gray-900">
                  {posts?.length || 0}
                </span>
                <span className="text-sm sm:text-sm text-gray-500 ml-1.5">
                  Posts
                </span>
              </div>
              <div>
                <span className="sm:text-xl font-bold text-gray-900">
                  {followersCount}
                </span>
                <span className="text-sm sm:text-sm text-gray-500 ml-1.5">
                  Follower
                </span>
              </div>
              <div>
                <span className="sm:text-xl font-bold text-gray-900">
                  {followingCount}
                </span>
                <span className="text-sm sm:text-sm text-gray-500 ml-1.5">
                  Following
                </span>
              </div>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
