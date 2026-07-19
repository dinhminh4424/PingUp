import React from "react";
import { Plus } from "lucide-react";

const MessagesHeader = ({ openNewChatModal }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Messages
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">
          Talk to your friends and Family
        </p>
      </div>

      <button
        onClick={openNewChatModal}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg shadow transition duration-200 cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        New Chat / Group
      </button>
    </div>
  );
};

export default MessagesHeader;
