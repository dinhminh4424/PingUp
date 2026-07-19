import api from "../../lib/axios";

export const getReportPost = async (
  searchQuery,
  statusFilter,
  startDate,
  endDate,
  page = 1,
  reasonFilter = "",
  reporterFilter = "",
) => {
  const res = await api.get(`/api/admin/report/posts`, {
    params: {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      page,
      reasonFilter,
      reporterFilter,
    },
  });
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  const res = await api.put(`/api/admin/report/${reportId}/status`, { status });
  return res.data;
};

export const getReportComment = async (
  searchQuery,
  statusFilter,
  startDate,
  endDate,
  page = 1,
  reasonFilter = "",
  reporterFilter = "",
) => {
  const res = await api.get(`/api/admin/report/comments`, {
    params: {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      page,
      reasonFilter,
      reporterFilter,
    },
  });
  return res.data;
};

export const getReportConversation = async (
  searchQuery,
  statusFilter,
  startDate,
  endDate,
  page = 1,
  reasonFilter = "",
  reporterFilter = "",
) => {
  const res = await api.get(`/api/admin/report/conversations`, {
    params: {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      page,
      reasonFilter,
      reporterFilter,
    },
  });
  return res.data;
};

export const getReportUser = async (
  searchQuery,
  statusFilter,
  startDate,
  endDate,
  page = 1,
  reasonFilter = "",
  reporterFilter = "",
) => {
  const res = await api.get(`/api/admin/report/users`, {
    params: {
      searchQuery,
      statusFilter,
      startDate,
      endDate,
      page,
      reasonFilter,
      reporterFilter,
    },
  });
  return res.data;
};
