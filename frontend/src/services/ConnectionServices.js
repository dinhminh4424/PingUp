import api from "../lib/axios";

export const sendConnectionRequest = async (data) => {
  const res = await api.post("/api/connection/sendConnectionRequest", data);
  return res.data;
};

export const getConnectionStatus = async (profileId) => {
  const res = await api.get(`/api/connection/status/${profileId}`);
  return res.data;
};

export const acceptConnectionRequest = async (requestId) => {
  const res = await api.post("/api/connection/accept", { requestId });
  return res.data;
};

export const rejectConnectionRequest = async (requestId) => {
  const res = await api.post("/api/connection/reject", { requestId });
  return res.data;
};

export const disconnectConnection = async (profileId) => {
  const res = await api.post("/api/connection/disconnect", { profileId });
  return res.data;
};

export const toggleFollow = async (profileId) => {
  const res = await api.post("/api/connection/follow", { profileId });
  return res.data;
};

export const getPendingRequests = async () => {
  const res = await api.get("/api/connection/pending");
  return res.data;
};

export const getConnectionsList = async () => {
  const res = await api.get("/api/connection/list");
  return res.data;
};
