import api from "../../lib/axios";

export const getUsers = async () => {
  const res = await api.get(`/api/admin/user`);
  return res.data;
};
