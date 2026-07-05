import api from "../lib/axios";

export const getNotifications = async (page = 1, limit = 10, tab = "all", unreadOnly = false) => {
  const res = await api.get("/api/notifications", {
    params: { page, limit, tab, unreadOnly }
  });
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/api/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.put("/api/notifications/read-all");
  return res.data;
};

export const deleteNotification = async (id) => {
  const res = await api.delete(`/api/notifications/${id}`);
  return res.data;
};

export const updateNotification = async (id, data) => {
  const res = await api.put(`/api/notifications/${id}`, data);
  return res.data;
};
