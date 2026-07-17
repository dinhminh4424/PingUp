import api from "../../lib/axios";

export const getPosts = async (searchQuery, statusFilter, startDate, endDate, page = 1) => {
  const res = await api.get(`/api/admin/post`, {
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

export const togglePostActive = async (postId) => {
  const res = await api.put(`/api/admin/post/${postId}/toggle-active`);
  return res.data;
};

export const togglePostDelete = async (postId) => {
  const res = await api.put(`/api/admin/post/${postId}/toggle-delete`);
  return res.data;
};

export const togglePostCommentDisabled = async (postId) => {
  const res = await api.put(`/api/admin/post/${postId}/toggle-comment-disabled`);
  return res.data;
};

export const getPostReports = async () => {
  const res = await api.get(`/api/admin/post/reports`);
  return res.data;
};
