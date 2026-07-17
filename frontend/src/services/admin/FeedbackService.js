import api from "../../lib/axios";

export const getFeedbacks = async (
  searchTerm,
  filterCategory,
  filterRating,
  startDate,
  endDate,
  page = 1,
) => {
  const res = await api.get(`/api/admin/feedback`, {
    params: {
      searchTerm,
      filterCategory,
      filterRating,
      startDate,
      endDate,
      page,
    },
  });
  return res.data;
};

export const updateFeedbackStatus = async (id, status) => {
  const res = await api.put(`/api/admin/feedback/${id}/status`, { status });
  return res.data;
};
