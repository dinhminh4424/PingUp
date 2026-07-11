import api from "../lib/axios";

export const getStoryForUser = async () => {
  const res = await api.get(`/api/story`);
  return res.data;
};

export const createPost = async (storyFormData) => {
  const res = await api.post("/api/story", storyFormData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const viewStory = async (storyId) => {
  const res = await api.post(`/api/story/${storyId}/view`);
  return res.data;
};
