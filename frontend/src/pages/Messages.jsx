import React, { useEffect, useState } from "react";
import { Eye, MessageSquare, Plus, Search, X, Users, User, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getConversations, createConversation } from "../services/Conversation";
import { getConnectionsList } from "../services/ConnectionServices";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Messages = () => {
  const navigate = useNavigate();
  const { userCurrent } = useAuth();
  const { onlineUsers } = useSocket();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Single state object to manage the new conversation form
  const [newChatForm, setNewChatForm] = useState({
    chatType: "direct", // direct or group
    groupName: "",
    groupImage: null,
    selectedFriends: [],
    friends: [],
    searchQuery: "",
    loadingFriends: false,
  });

  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await getConversations();
      setConversations(result.conversations || []);
    } catch (err) {
      console.log("LỖI: ", err);
      setError("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, []);

  const openNewChatModal = async () => {
    setShowNewChatModal(true);
    setNewChatForm({
      chatType: "direct",
      groupName: "",
      groupImage: null,
      selectedFriends: [],
      friends: [],
      searchQuery: "",
      loadingFriends: true,
    });
    
    try {
      const res = await getConnectionsList();
      if (res.success) {
        setNewChatForm((prev) => ({
          ...prev,
          friends: res.connections || [],
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách bạn bè");
    } finally {
      setNewChatForm((prev) => ({
        ...prev,
        loadingFriends: false,
      }));
    }
  };

  const handleStartChat = async (friendId) => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      const res = await createConversation({
        type: "direct",
        memberIds: [friendId],
      });
      if (res.success) {
        setShowNewChatModal(false);
        toast.success("Đã tạo cuộc hội thoại!");
        navigate(`/messages/${res.conversation._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Tạo cuộc hội thoại thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateGroupChat = async () => {
    if (isCreating) return;
    if (!newChatForm.groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm");
      return;
    }
    if (newChatForm.selectedFriends.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên");
      return;
    }
    try {
      setIsCreating(true);
      const res = await createConversation({
        type: "group",
        name: newChatForm.groupName.trim(),
        memberIds: newChatForm.selectedFriends,
        imageGroup: newChatForm.groupImage, // Truyền file ảnh đại diện nhóm
      });
      if (res.success) {
        setShowNewChatModal(false);
        setNewChatForm({
          chatType: "direct",
          groupName: "",
          groupImage: null,
          selectedFriends: [],
          friends: [],
          searchQuery: "",
          loadingFriends: false,
        });
        toast.success("Đã tạo nhóm trò chuyện!");
        navigate(`/messages/${res.conversation._id}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Tạo nhóm trò chuyện thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleSelectFriend = (friendId) => {
    if (isCreating) return;
    setNewChatForm((prev) => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter((id) => id !== friendId)
        : [...prev.selectedFriends, friendId],
    }));
  };

  const filteredFriends = newChatForm.friends.filter(
    (friend) =>
      friend.full_name?.toLowerCase().includes(newChatForm.searchQuery.toLowerCase()) ||
      friend.username?.toLowerCase().includes(newChatForm.searchQuery.toLowerCase())
  );

  const renderConversationAvatar = (conver) => {
    if (conver.type === "direct") {
      const user = conver.participants?.find(
        (p) => p.userId && p.userId._id !== userCurrent?._id
      )?.userId;
      
      const isOnline = user && onlineUsers.includes(user._id);

      if (user && user.profile_picture) {
        return (
          <div className="relative flex-shrink-0">
            <img
              src={user.profile_picture}
              className="rounded-full size-12 object-cover border border-gray-100"
              alt=""
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
        );
      }
      
      const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : "?";
      return (
        <div className="relative flex-shrink-0">
          <div className="rounded-full size-12 bg-indigo-650 text-white flex items-center justify-center font-bold text-lg border border-gray-100">
            {initial}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          )}
        </div>
      );
    }

    // Nếu là nhóm chat và đã tải lên ảnh đại diện nhóm
    if (conver.type === "group" && conver.profile_picture) {
      return (
        <img
          src={conver.profile_picture}
          className="rounded-full size-12 object-cover border border-gray-100 flex-shrink-0"
          alt=""
        />
      );
    }

    // Group chat avatar: overlapping members
    const activeParticipants = conver.participants || [];
    const displayedParticipants = activeParticipants.slice(0, 3);
    
    return (
      <div className="relative w-12 h-12 flex-shrink-0">
        {displayedParticipants.map((p, idx) => {
          const user = p.userId;
          if (!user) return null;
          
          let posClass = "absolute size-7 rounded-full border-2 border-white object-cover shadow-sm ";
          if (idx === 0) posClass += "z-30 left-0 top-0";
          else if (idx === 1) posClass += "z-20 left-2.5 top-2";
          else if (idx === 2) posClass += "z-10 left-5 top-4";

          if (user.profile_picture) {
            return (
              <img
                key={user._id}
                src={user.profile_picture}
                className={posClass}
                alt=""
              />
            );
          }

          const initial = user.full_name ? user.full_name.charAt(0).toUpperCase() : "?";
          return (
            <div
              key={user._id}
              className={`${posClass} flex items-center justify-center bg-indigo-500 text-white text-[10px] font-bold`}
            >
              {initial}
            </div>
          );
        })}
      </div>
    );
  };

  return !isLoading ? (
    <div className="min-h-screen relative bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Messages</h1>
            <p className="text-slate-600">Talk to your friends and Family</p>
          </div>
          
          <button
            onClick={openNewChatModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow transition duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            New Chat / Group
          </button>
        </div>

        {error && <h2 className="text-red-650 mb-4">{error}</h2>}

        {/* Connected Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.length > 0 ? (
            conversations.map((conver) => {
              return (
                <div
                  key={conver._id}
                  className="flex gap-4 p-5 bg-white shadow rounded-md border border-gray-100 hover:shadow-md transition"
                >
                  {renderConversationAvatar(conver)}

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                      {conver.type === "group" && <Users className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
                      {conver.full_name}
                    </p>
                    <p className="text-slate-500 text-sm truncate">
                      {conver.type === "direct" ? `@${conver.username}` : `${conver.participants?.length || 0} members`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {conver.lastMessage?.content || conver.bio || "No messages yet"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/messages/${conver._id}`)}
                      className="size-10 flex items-center justify-center text-sm rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600 active:scale-95 transition cursor-pointer"
                      title="Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    {conver.type === "direct" && (
                      <button
                        onClick={() => navigate(`/profile/${conver.targetUserId || conver._id}`)}
                        className="size-10 flex items-center justify-center text-sm rounded bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition cursor-pointer"
                        title="Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-16 bg-white rounded-md border border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">No conversations found.</p>
              <button
                onClick={openNewChatModal}
                className="inline-flex items-center gap-2 border border-indigo-600 text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
              >
                Start your first chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all flex flex-col max-h-[550px]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">New Conversation</h2>
              <button
                onClick={() => setShowNewChatModal(false)}
                disabled={isCreating}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs for Direct vs Group */}
            <div className="flex border-b border-gray-100 bg-slate-50">
              <button
                onClick={() => !isCreating && setNewChatForm((prev) => ({ ...prev, chatType: "direct" }))}
                disabled={isCreating}
                className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition cursor-pointer ${
                  newChatForm.chatType === "direct"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Direct Chat
              </button>
              <button
                onClick={() => !isCreating && setNewChatForm((prev) => ({ ...prev, chatType: "group" }))}
                disabled={isCreating}
                className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition cursor-pointer ${
                  newChatForm.chatType === "group"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Group Chat
              </button>
            </div>

            {/* Group Name & Image input if Group tab */}
            {newChatForm.chatType === "group" && (
              <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Group Name</label>
                  <input
                    type="text"
                    disabled={isCreating}
                    placeholder="Enter group name..."
                    value={newChatForm.groupName}
                    onChange={(e) => setNewChatForm((prev) => ({ ...prev, groupName: e.target.value }))}
                    className="w-full outline-none border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Group Photo</label>
                  <label className="flex items-center justify-center border border-gray-200 rounded-lg cursor-pointer size-11 bg-slate-50 hover:bg-slate-100 relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={isCreating}
                      onChange={(e) => setNewChatForm((prev) => ({ ...prev, groupImage: e.target.files[0] }))}
                    />
                    {newChatForm.groupImage ? (
                      <img src={URL.createObjectURL(newChatForm.groupImage)} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Plus className="w-4 h-4 text-gray-400" />
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                disabled={isCreating}
                placeholder="Search friends..."
                value={newChatForm.searchQuery}
                onChange={(e) => setNewChatForm((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full outline-none bg-transparent text-sm text-gray-700 disabled:opacity-50"
              />
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {newChatForm.loadingFriends ? (
                <div className="text-center py-6 text-gray-500 text-sm">Loading friends...</div>
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => {
                  const isChecked = newChatForm.selectedFriends.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() =>
                        newChatForm.chatType === "direct" ? handleStartChat(friend._id) : handleToggleSelectFriend(friend._id)
                      }
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-gray-150 ${isCreating ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <img
                        src={friend.profile_picture || "/default-avatar.png"}
                        className="rounded-full w-10 h-10 object-cover"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {friend.full_name}
                        </p>
                        <p className="text-slate-500 text-xs truncate">@{friend.username}</p>
                      </div>

                      {/* Checkbox for group creation */}
                      {newChatForm.chatType === "group" && (
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isCreating}
                          onChange={() => handleToggleSelectFriend(friend._id)}
                          className="w-4 h-4 rounded text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {newChatForm.friends.length === 0 ? "You need connections to start a chat." : "No friends found matching search."}
                </div>
              )}
            </div>

            {/* Footer for group chat creation */}
            {newChatForm.chatType === "group" && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                <span className="text-xs text-gray-500 self-center mr-auto">
                  {newChatForm.selectedFriends.length} selected
                </span>
                <button
                  onClick={() => setShowNewChatModal(false)}
                  disabled={isCreating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 bg-white font-medium text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroupChat}
                  disabled={newChatForm.selectedFriends.length === 0 || isCreating}
                  className={`px-4 py-2 rounded-lg font-medium text-xs transition cursor-pointer text-white flex items-center gap-1.5 ${
                    newChatForm.selectedFriends.length > 0 && !isCreating
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-indigo-300 cursor-not-allowed"
                  }`}
                >
                  {isCreating ? (
                    <>
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Messages;
