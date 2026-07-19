import React, { useState } from "react";
import { X, Search, Plus, LoaderCircle } from "lucide-react";
import { searchGroups, requestToJoinGroup } from "../../services/ConversationServices";
import toast from "react-hot-toast";

const NewChatModal = ({
  setShowNewChatModal,
  isCreating,
  newChatForm,
  setNewChatForm,
  filteredFriends,
  handleStartChat,
  handleToggleSelectFriend,
  handleCreateGroupChat,
  userCurrent,
}) => {
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [groupResults, setGroupResults] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const handleGroupSearch = async (val) => {
    setGroupSearchQuery(val);
    if (!val.trim()) {
      setGroupResults([]);
      return;
    }
    setLoadingGroups(true);
    try {
      const res = await searchGroups(val);
      if (res.success) {
        setGroupResults(res.groups || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleJoinRequest = async (groupId) => {
    try {
      const res = await requestToJoinGroup(groupId);
      if (res.success) {
        toast.success("Sent request to join group!");
        setGroupResults((prev) =>
          prev.map((g) => {
            if (g._id === groupId) {
              return {
                ...g,
                joinRequests: [...(g.joinRequests || []), { userId: userCurrent?._id }],
              };
            }
            return g;
          })
        );
      } else {
        toast.error(res.message || "Failed to send request");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full overflow-hidden transform transition-all flex flex-col max-h-[650px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            New Conversation
          </h2>
          <button
            onClick={() => setShowNewChatModal(false)}
            disabled={isCreating}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs for Direct vs Group vs Join Group */}
        <div className="flex border-b border-gray-100 bg-slate-50">
          <button
            onClick={() =>
              !isCreating &&
              setNewChatForm((prev) => ({ ...prev, chatType: "direct" }))
            }
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
            onClick={() =>
              !isCreating &&
              setNewChatForm((prev) => ({ ...prev, chatType: "group" }))
            }
            disabled={isCreating}
            className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition cursor-pointer ${
              newChatForm.chatType === "group"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Group Chat
          </button>
          <button
            onClick={() =>
              !isCreating &&
              setNewChatForm((prev) => ({ ...prev, chatType: "join_group" }))
            }
            disabled={isCreating}
            className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition cursor-pointer ${
              newChatForm.chatType === "join_group"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Join Group
          </button>
        </div>

        {/* Group Name & Image input if Group tab */}
        {newChatForm.chatType === "group" && (
          <div className="p-4 border-b border-gray-100 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Group Name
              </label>
              <input
                type="text"
                disabled={isCreating}
                placeholder="Enter group name..."
                value={newChatForm.groupName}
                onChange={(e) =>
                  setNewChatForm((prev) => ({
                    ...prev,
                    groupName: e.target.value,
                  }))
                }
                className="w-full outline-none border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Group Photo
              </label>
              <label className="flex items-center justify-center border border-gray-200 rounded-lg cursor-pointer size-11 bg-slate-50 hover:bg-slate-100 relative overflow-hidden">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={isCreating}
                  onChange={(e) =>
                    setNewChatForm((prev) => ({
                      ...prev,
                      groupImage: e.target.files[0],
                    }))
                  }
                />
                {newChatForm.groupImage ? (
                  <img
                    src={URL.createObjectURL(newChatForm.groupImage)}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <Plus className="w-4 h-4 text-gray-400" />
                )}
              </label>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {newChatForm.chatType === "join_group" ? (
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name..."
              value={groupSearchQuery}
              onChange={(e) => handleGroupSearch(e.target.value)}
              className="w-full outline-none bg-transparent text-sm text-gray-700"
            />
          </div>
        ) : (
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              disabled={isCreating}
              placeholder="Search friends..."
              value={newChatForm.searchQuery}
              onChange={(e) =>
                setNewChatForm((prev) => ({
                  ...prev,
                  searchQuery: e.target.value,
                }))
              }
              className="w-full outline-none bg-transparent text-sm text-gray-700 disabled:opacity-50"
            />
          </div>
        )}

        {/* Friends / Groups List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {newChatForm.chatType === "join_group" ? (
            loadingGroups ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                Searching groups...
              </div>
            ) : groupResults.length > 0 ? (
              groupResults.map((group) => {
                const isMember = group.participants?.some(
                  (p) => p.userId?._id === userCurrent?._id || p.userId === userCurrent?._id
                );
                const hasRequested = group.joinRequests?.some(
                  (r) => r.userId === userCurrent?._id || r.userId?._id === userCurrent?._id
                );

                return (
                  <div
                    key={group._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={group.profile_picture || "/default-avatar.avif"}
                        className="rounded-full w-10 h-10 object-cover"
                        alt=""
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {group.full_name || group.group?.name}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {group.participants?.length || 0} members
                        </p>
                      </div>
                    </div>

                    <div>
                      {isMember ? (
                        <button
                          onClick={() => {
                            setShowNewChatModal(false);
                            window.location.href = `/messages/${group._id}`;
                          }}
                          className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 rounded-md font-medium cursor-pointer"
                        >
                          Open Chat
                        </button>
                      ) : hasRequested ? (
                        <span className="px-3 py-1.5 text-xs bg-gray-105 text-gray-500 rounded-md font-medium select-none">
                          Requested
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoinRequest(group._id)}
                          className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium cursor-pointer"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                No groups found matching search.
              </div>
            )
          ) : newChatForm.loadingFriends ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Loading friends...
            </div>
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const isChecked = newChatForm.selectedFriends.includes(friend._id);
              return (
                <div
                  key={friend._id}
                  onClick={() =>
                    newChatForm.chatType === "direct"
                      ? handleStartChat(friend._id)
                      : handleToggleSelectFriend(friend._id)
                  }
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-gray-100 ${
                    isCreating ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <img
                    src={friend.profile_picture || "/default-avatar.avif"}
                    className="rounded-full w-10 h-10 object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">
                      {friend.full_name}
                    </p>
                    <p className="text-slate-500 text-xs truncate">
                      @{friend.username}
                    </p>
                  </div>

                  {/* Checkbox for group creation */}
                  {newChatForm.chatType === "group" && (
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isCreating}
                      readOnly
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              {newChatForm.friends.length === 0
                ? "You need connections to start a chat."
                : "No friends found matching search."}
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
  );
};

export default NewChatModal;
