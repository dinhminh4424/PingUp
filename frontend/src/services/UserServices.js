import api from "../lib/axios";

export const getUserById = async (id) => {
  const res = await api.get(`/api/user/${id}`);
  return res.data;
};

export const updateInfoUser = async (updateData) => {
  const formData = new FormData();

  Object.keys(updateData).forEach((key) => {
    if (key === "profile_picture") {
      if (updateData.profile_picture) {
        formData.append("profile_picture", updateData.profile_picture);
      }
    } else if (key === "cover_photo") {
      if (updateData.cover_photo) {
        formData.append("cover_photo", updateData.cover_photo);
      }
    } else if (updateData[key] !== undefined && updateData[key] !== null) {
      if (Array.isArray(updateData[key])) {
        updateData[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, updateData[key]);
      }
    }
  });
  const res = await api.put(`/api/user`, formData);
  return res.data.user;
};

export const findUserBySearch = async (search) => {
  const res = await api.get(`/api/user/search`, {
    params: { search }
  });
  return res.data;
};
