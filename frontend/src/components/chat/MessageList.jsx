import React from "react";
import MessageItem from "./MessageItem";

const MessageList = ({
  scrollContainerRef,
  handleScroll,
  currentConversation,
  messages,
  userCurrent,
  handleContextMenu,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  openImageModal,
  setSelectedReactionsMessage,
  handleReact,
  activeReactPickerMsgId,
  setActiveReactPickerMsgId,
  activeDropdownMsgId,
  setActiveDropdownMsgId,
  setMessageToRecall,
  setReplyingTo,
  handleDeleteMessageForMe,
}) => {
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 p-4 md:px-8 overflow-y-auto transition-all duration-300"
      style={{
        backgroundColor:
          currentConversation?.theme?.type === "image"
            ? undefined
            : currentConversation?.theme?.value || "#eef0f3",
        backgroundImage:
          currentConversation?.theme?.type === "image"
            ? `url(${currentConversation.theme.value})`
            : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex flex-col-reverse space-y-reverse space-y-3.5 max-w-4xl mx-auto pb-24">
        {messages.map((message, index) => (
          <MessageItem
            key={message._id || index}
            message={message}
            index={index}
            userCurrent={userCurrent}
            handleContextMenu={handleContextMenu}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            openImageModal={openImageModal}
            setSelectedReactionsMessage={setSelectedReactionsMessage}
            handleReact={handleReact}
            activeReactPickerMsgId={activeReactPickerMsgId}
            setActiveReactPickerMsgId={setActiveReactPickerMsgId}
            activeDropdownMsgId={activeDropdownMsgId}
            setActiveDropdownMsgId={setActiveDropdownMsgId}
            setMessageToRecall={setMessageToRecall}
            setReplyingTo={setReplyingTo}
            handleDeleteMessageForMe={handleDeleteMessageForMe}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
