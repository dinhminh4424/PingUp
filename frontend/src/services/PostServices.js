import api from "../lib/axios";

export const getPost = async (page = 1, limit = 10) => {
  const res = await api.get("/api/posts", {
    params: { page, limit },
  });
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

export const updatePost = async (id, postData) => {
  const res = await api.put(`/api/posts/${id}`, postData);
  return res.data;
};

export const deletePost = async (id) => {
  const res = await api.delete(`/api/posts/${id}`);
  return res.data;
};

export const toggleLike = async (id) => {
  const res = await api.put(`/api/posts/${id}/toggleLike`);
  return res.data;
};

export const getPostById = async (id) => {
  const res = await api.get(`/api/posts/${id}`);
  return res.data;
};

export const sharePost = async (originalPostId, content) => {
  const res = await api.post("/api/posts/sharePost", {
    originalPostId,
    content,
  });
  return res.data;
};

export const getLikedPosts = async (userId) => {
  const res = await api.get(`/api/posts/user/${userId}/liked`);
  return res.data;
};

export const reportPost = async (postId, data) => {
  const res = await api.post(`/api/posts/${postId}/report`, data);
  return res.data;
};
