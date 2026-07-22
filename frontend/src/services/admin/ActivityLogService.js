import api from "../../lib/axios";

export const getAllLogs = async (page = 1, limit = 20, actionFilter = "", searchQuery = "") => {
  const res = await api.get(`/api/admin/logs`, {
    params: {
      page,
      limit,
      actionFilter,
      searchQuery,
    },
  });
  return res.data;
};

export const getLogStats = async () => {
  const res = await api.get(`/api/admin/logs/stats`);
  return res.data;
};

export const getSuspiciousActivities = async () => {
  const res = await api.get(`/api/admin/logs/alerts`);
  return res.data;
};
