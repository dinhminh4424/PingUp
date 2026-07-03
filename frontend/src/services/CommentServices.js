import api from "../lib/axios";

export const getCommentsByPost = async (postId) => {
  const res = await api.get(`/api/comments/post/${postId}`);
  return res.data;
};

export const createComment = async (postId, content, parentCommentId = null, imageFile = null) => {
  const formData = new FormData();
  formData.append("postId", postId);
  formData.append("content", content);
  
  if (parentCommentId) {
    formData.append("parentCommentId", parentCommentId);
  }
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await api.post("/api/comments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const toggleLikeComment = async (commentId) => {
  const res = await api.put(`/api/comments/${commentId}/toggleLike`);
  return res.data;
};

export const deleteComment = async (commentId) => {
  const res = await api.delete(`/api/comments/${commentId}`);
  return res.data;
};
