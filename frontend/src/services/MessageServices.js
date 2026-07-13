import api from "../lib/axios";

export const getMessages = async (conversationId, page = 1, limit = 20) => {
  const res = await api.get(`/api/message/${conversationId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const sendMessage = async (conversationId, content, imageFiles, fileFiles, replyTo, linkPreview) => {
  const formData = new FormData();
  formData.append("conversationId", conversationId);
  if (content) {
    formData.append("content", content);
  }
  if (replyTo) {
    formData.append("replyTo", replyTo);
  }
  if (linkPreview) {
    formData.append("linkPreview", JSON.stringify(linkPreview));
  }
  if (imageFiles) {
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
    } else {
      formData.append("images", imageFiles);
    }
  }
  if (fileFiles) {
    if (Array.isArray(fileFiles)) {
      fileFiles.forEach((file) => {
        formData.append("files", file);
      });
    } else {
      formData.append("files", fileFiles);
    }
  }

  const res = await api.post("/api/message", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const reactToMessage = async (messageId, emoji) => {
  const res = await api.post(`/api/message/${messageId}/react`, { emoji });
  return res.data;
};

export const getLinkPreview = async (url) => {
  const res = await api.get("/api/message/link-preview", {
    params: { url },
  });
  return res.data;
};

export const recallMessage = async (messageId) => {
  const res = await api.delete(`/api/message/${messageId}/recall`);
  return res.data;
};

export const deleteMessageForMe = async (messageId) => {
  const res = await api.delete(`/api/message/${messageId}/delete`);
  return res.data;
};
