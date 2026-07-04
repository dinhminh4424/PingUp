import React, { useState } from "react";
import {
  MapPin,
  MessageCircle,
  Plus,
  UserPlus,
  UserCheck,
  LoaderCircle,
  UserMinus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectConnection,
  toggleFollow,
} from "../services/ConnectionServices";
import toast from "react-hot-toast";

const UserCard = ({ user }) => {
  const { userCurrent } = useAuth();

  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isConnected, setIsConnected] = useState(user.isConnected || false);
  const [requestSent, setRequestSent] = useState(user.requestSent || false);
  const [requestReceived, setRequestReceived] = useState(
    user.requestReceived || false,
  );
  const [requestId, setRequestId] = useState(user.requestId || null);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await toggleFollow(user._id);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        toast.success(
          res.message || (res.isFollowing ? "Followed!" : "Unfollowed!"),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to follow");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionRequest = async () => {
    if (loading) return;
    try {
      setLoading(true);
      if (isConnected) {
        const res = await disconnectConnection(user._id);
        if (res.success) {
          setIsConnected(false);
          toast.success("Disconnected friend");
        }
      } else if (!requestSent && !requestReceived) {
        const res = await sendConnectionRequest({ receiver: user._id });
        if (res.success) {
          setRequestSent(true);
          setRequestId(res.request?._id || null);
          toast.success("Friend request sent!");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (loading || !requestId) return;
    try {
      setLoading(true);
      const res = await acceptConnectionRequest(requestId);
      if (res.success) {
        setIsConnected(true);
        setRequestReceived(false);
        setRequestId(null);
        toast.success("Accepted friend request!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (loading || !requestId) return;
    try {
      setLoading(true);
      const res = await rejectConnectionRequest(requestId);
      if (res.success) {
        setRequestReceived(false);
        setRequestSent(false);
        setRequestId(null);
        toast.success("Rejected/Cancelled friend request");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={user._id}
      className="p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white"
    >
      <div className="text-center">
        <img
          src={user.profile_picture || "/default-avatar.avif"}
          className="rounded-full w-16 h-16 object-cover shadow-md mx-auto"
          alt=""
        />
        <p className="mt-4 font-semibold text-gray-800">{user.full_name}</p>
        {user.username && (
          <p className="text-gray-500 font-light text-sm">@{user.username}</p>
        )}
        {user.bio && (
          <p className="text-gray-600 mt-2 text-center text-sm px-4 truncate">
            {user.bio}
          </p>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 truncate max-w-[120px]">
          <MapPin className="w-4 h-4 shrink-0" />{" "}
          {user.location || "Chưa cập nhật"}
        </div>
        <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
          <span>{user.followersCount || user.followers?.length || 0}</span>{" "}
          followers
        </div>
      </div>

      <div className="flex mt-4 gap-2">
        {/* Follower button */}
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`flex-1 py-2 rounded-md flex justify-center items-center gap-2 border transition font-semibold cursor-pointer text-xs ${
            isFollowing
              ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          }`}
        >
          {loading ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <>
              {isFollowing ? (
                <UserMinus className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </>
          )}
        </button>

        {/* Connection request Button / Accept / Reject / Friends */}
        {isConnected ? (
          <button
            onClick={handleConnectionRequest}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md cursor-pointer transition flex items-center gap-1 font-semibold text-xs shrink-0"
          >
            <UserCheck className="w-4 h-4 text-green-600" />
            <span>Friends</span>
          </button>
        ) : requestSent ? (
          <button
            onClick={handleRejectRequest}
            disabled={loading}
            className="px-3 py-2 border border-red-350 hover:bg-red-50 text-red-600 rounded-md cursor-pointer transition font-semibold text-xs shrink-0"
          >
            Cancel
          </button>
        ) : requestReceived ? (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={handleAcceptRequest}
              disabled={loading}
              className="px-2.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md cursor-pointer transition font-semibold text-xs"
            >
              Accept
            </button>
            <button
              onClick={handleRejectRequest}
              disabled={loading}
              className="px-2.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md cursor-pointer transition font-semibold text-xs"
            >
              Reject
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectionRequest}
            disabled={loading}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer transition font-semibold text-xs flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
