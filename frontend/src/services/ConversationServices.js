import api from "../lib/axios";

export const getConversations = async () => {
  const res = await api.get("/api/conversation");
  return res.data;
};

export const getConversationById = async (conversationId) => {
  const res = await api.get(`/api/conversation/${conversationId}`);
  return res.data;
};

export const createConversation = async (dataConversation) => {
  const formData = new FormData();
  Object.keys(dataConversation).forEach((key) => {
    if (key === "memberIds") {
      formData.append("memberIds", JSON.stringify(dataConversation[key]));
    } else if (
      dataConversation[key] !== undefined &&
      dataConversation[key] !== null
    ) {
      formData.append(key, dataConversation[key]);
    }
  });

  const res = await api.post("/api/conversation", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateConversation = async (conversationId, name, imageGroupFile) => {
  const formData = new FormData();
  if (name) formData.append("name", name);
  if (imageGroupFile) formData.append("imageGroup", imageGroupFile);

  const res = await api.put(`/api/conversation/${conversationId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateConversationCustomization = async (conversationId, data) => {
  const res = await api.put(`/api/conversation/${conversationId}/customization`, data);
  return res.data;
};
