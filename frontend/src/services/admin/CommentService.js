import api from "../../lib/axios";

export const toggleCommentActive = async (id) => {
  const res = await api.put(`/api/admin/comment/${id}/toggle-active`);
  return res.data;
};

export const toggleCommentDelete = async (id) => {
  const res = await api.put(`/api/admin/comment/${id}/toggle-delete`);
  return res.data;
};
