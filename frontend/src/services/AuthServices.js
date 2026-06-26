import api from "../lib/axios";

export const login = async (data) => {
  const login = {
    email: data.email,
    password: data.password,
  };

  const res = await api.post("/api/auth/login", login);
  return res;
};

export const register = async (data) => {
  console.log("data: ", data);

  const user = {
    email: data.email,
    username: data.username,
    password: data.password,
    full_name: data.full_name,
  };
  const res = await api.post("/api/auth/register", user);

  return res.data;
};

export const logout = async () => {
  const res = await api.post("/api/auth/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/api/user/me", { withCredentials: true });

  return res.data.user;
};
