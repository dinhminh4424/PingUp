import api from "../../lib/axios";

export const getUsers = async (
  searchQuery,
  roleFilter,
  statusFilter,
  page = 1,
) => {
  const res = await api.get(`/api/admin/user`, {
    params: {
      searchQuery,
      roleFilter,
      statusFilter,
      page,
    },
  });
  return res.data;
};

export const toggleUserActive = async (userId) => {
  const res = await api.put(`/api/admin/user/${userId}/toggle-active`);
  return res.data;
};

export const toggleUserRole = async (userId) => {
  const res = await api.put(`/api/admin/user/${userId}/toggle-role`);
  return res.data;
};

export const getUserDetail = async (userId) => {
  const res = await api.get(`/api/admin/user/${userId}`);
  return res.data;
};
