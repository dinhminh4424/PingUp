import api from "../lib/axios";

export const getPost = async () => {
  const res = await api.get("/api/posts");
  return res.data;
};

export const getPostsByIdUser = async (userId) => {
  const res = await api.get(`/api/posts/user/${userId}`);
  return res.data;
};

export const createPost = async (postData) => {
  const formData = new FormData();

  Object.keys(postData).forEach((key) => {
    if (key === "images") {
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((file) => {
          formData.append("images", file);
        });
      }
    } else if (postData[key] !== undefined && postData[key] !== null) {
      if (Array.isArray(postData[key])) {
        postData[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, postData[key]);
      }
    }
  });

  const res = await api.post("/api/posts/create", formData);
  return res.data;
};
