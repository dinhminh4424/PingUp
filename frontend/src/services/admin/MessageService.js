import api from "../../lib/axios";

export const getConversations = async (searchQuery, statusFilter, page = 1) => {
  const res = await api.get(`/api/admin/message`, {
    params: {
      searchQuery,
      statusFilter,
      page,
    },
  });
  return res.data;
};

export const getConversationMessages = async (conversationId, page = 1) => {
  const res = await api.get(`/api/admin/message/${conversationId}/messages`, {
    params: { page },
  });
  return res.data;
};

export const deleteMessage = async (messageId) => {
  const res = await api.delete(`/api/admin/message/messages/${messageId}`);
  return res.data;
};

export const deleteConversation = async (conversationId) => {
  const res = await api.delete(`/api/admin/message/conversations/${conversationId}`);
  return res.data;
};

export const toggleConversationActive = async (conversationId) => {
  const res = await api.put(`/api/admin/message/conversations/${conversationId}/toggle-active`);
  return res.data;
};

export const toggleConversationDelete = async (conversationId) => {
  const res = await api.put(`/api/admin/message/conversations/${conversationId}/toggle-delete`);
  return res.data;
};
