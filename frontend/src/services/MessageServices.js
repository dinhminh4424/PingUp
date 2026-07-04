import api from "../lib/axios";

export const getMessages = async (conversationId, page = 1, limit = 20) => {
  const res = await api.get(`/api/message/${conversationId}`, {
    params: { page, limit },
  });
  return res.data;
};

export const sendMessage = async (conversationId, content, imageFiles) => {
  const formData = new FormData();
  formData.append("conversationId", conversationId);
  if (content) {
    formData.append("content", content);
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

  const res = await api.post("/api/message", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
