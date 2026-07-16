import api from "../lib/axios";

export const getAppeal = async () => {
  const res = await api.get(`/api/appeal`);
  return res.data;
};

export const createAppeal = async (formData) => {
  const res = await api.post(`/api/appeal`, formData);
  return res.data;
};
