import api from "../../lib/axios";

export const getReportPost = async (searchQuery, statusFilter, startDate, endDate, page = 1) => {
  const res = await api.get(`/api/admin/report/posts`, {
    params: {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      page,
    },
  });
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  const res = await api.put(`/api/admin/report/${reportId}/status`, { status });
  return res.data;
};
