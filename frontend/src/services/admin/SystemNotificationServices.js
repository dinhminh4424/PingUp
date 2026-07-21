import api from "../../lib/axios";

// Templates
export const getTemplates = async () => {
  const res = await api.get("/api/admin/notifications/templates");
  return res.data;
};

export const createTemplate = async (data) => {
  const res = await api.post("/api/admin/notifications/templates", data);
  return res.data;
};

export const updateTemplate = async (id, data) => {
  const res = await api.put(`/api/admin/notifications/templates/${id}`, data);
  return res.data;
};

export const deleteTemplate = async (id) => {
  const res = await api.delete(`/api/admin/notifications/templates/${id}`);
  return res.data;
};

// Upload Image
export const uploadModalImage = async (formData) => {
  const res = await api.post("/api/admin/notifications/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Broadcasts / Sending
export const sendBroadcast = async (data) => {
  const res = await api.post("/api/admin/notifications/broadcast", data);
  return res.data;
};

export const getBroadcastHistory = async (params = {}) => {
  const res = await api.get("/api/admin/notifications/history", { params });
  return res.data;
};

export const revokeBroadcast = async (id) => {
  const res = await api.delete(`/api/admin/notifications/history/${id}`);
  return res.data;
};
