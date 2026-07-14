import api from "../lib/axios";

export const createFeedBack = async (formFeedBackData) => {
  const res = await api.post("/api/feedback/create", formFeedBackData);
  return res.data;
};
