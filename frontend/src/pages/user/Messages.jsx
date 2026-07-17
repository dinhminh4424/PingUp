import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getConversations,
  createConversation,
} from "../../services/ConversationServices";
import { getConnectionsList } from "../../services/ConnectionServices";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";

// Import extracted components
import MessagesHeader from "../../components/messages/MessagesHeader";
import ConversationItem from "../../components/messages/ConversationItem";
import NewChatModal from "../../components/messages/NewChatModal";

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
      friend.full_name
        ?.toLowerCase()
        .includes(newChatForm.searchQuery.toLowerCase()) ||
      friend.username
        ?.toLowerCase()
        .includes(newChatForm.searchQuery.toLowerCase()),
  );

  return !isLoading ? (
    <div className="min-h-screen relative bg-slate-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto p-6">
        <MessagesHeader openNewChatModal={openNewChatModal} />

        {error && <h2 className="text-red-600 mb-4">{error}</h2>}

        {/* Connected Users */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.length > 0 ? (
            conversations.map((conver) => (
              <ConversationItem
                key={conver._id}
                conver={conver}
                userCurrent={userCurrent}
                onlineUsers={onlineUsers}
                navigate={navigate}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-16 bg-white dark:bg-zinc-900 rounded-md border border-dashed border-gray-200 dark:border-zinc-800">
              <p className="text-gray-500 dark:text-zinc-400 mb-4">
                No conversations found.
              </p>
              <button
                onClick={openNewChatModal}
                className="inline-flex items-center gap-2 border border-indigo-600 text-indigo-600 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition cursor-pointer"
              >
                Start your first chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          setShowNewChatModal={setShowNewChatModal}
          isCreating={isCreating}
          newChatForm={newChatForm}
          setNewChatForm={setNewChatForm}
          filteredFriends={filteredFriends}
          handleStartChat={handleStartChat}
          handleToggleSelectFriend={handleToggleSelectFriend}
          handleCreateGroupChat={handleCreateGroupChat}
          userCurrent={userCurrent}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Messages;
