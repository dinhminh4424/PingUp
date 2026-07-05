import api from "../lib/axios";

export const getFollower = async () => {
  const res = await api.get("/api/follow/follower");
  return res.data;
};

export const getFollowing = async () => {
  const res = await api.get("/api/follow/following");
  return res.data;
};
