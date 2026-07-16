import api from "../../lib/axios";

export const getOverviewStats = async () => {
  const res = await api.get(`/api/admin/stats/overview`);
  return res.data;
};

export const getUserStats = async (period = "7days", role = "all", status = "all", startDate = null, endDate = null) => {
  const res = await api.get(`/api/admin/stats/users`, {
    params: { period, role, status, startDate, endDate, _t: Date.now() }
  });
  return res.data;
};

export const getPostStats = async (period = "7days", postType = "all", startDate = null, endDate = null) => {
  const res = await api.get(`/api/admin/stats/posts`, {
    params: { period, postType, startDate, endDate, _t: Date.now() }
  });
  return res.data;
};

export const getReportStats = async (period = "7days", targetType = "all", status = "all", startDate = null, endDate = null) => {
  const res = await api.get(`/api/admin/stats/reports`, {
    params: { period, targetType, status, startDate, endDate, _t: Date.now() }
  });
  return res.data;
};

export const getStoryStats = async (period = "7days", storyType = "all", startDate = null, endDate = null) => {
  const res = await api.get(`/api/admin/stats/stories`, {
    params: { period, storyType, startDate, endDate, _t: Date.now() }
  });
  return res.data;
};

export const getMessageStats = async (period = "7days", startDate = null, endDate = null) => {
  const res = await api.get(`/api/admin/stats/messages`, {
    params: { period, startDate, endDate, _t: Date.now() }
  });
  return res.data;
};
