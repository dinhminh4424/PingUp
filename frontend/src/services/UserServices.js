import api from "../lib/axios";

export const getUserById = async (id) => {
  const res = await api.get(`/api/user/${id}`);
  return res.data;
};
