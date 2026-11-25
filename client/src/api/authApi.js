import { axiosClient } from "./axiosClient";

export const authApi = {
  me: () => axiosClient.get("/auth/me").then((r) => r.data),
  login: (payload) => axiosClient.post("/auth/login", payload).then((r) => r.data),
  register: (payload) => axiosClient.post("/auth/register", payload).then((r) => r.data),
  logout: () => axiosClient.post("/auth/logout").then((r) => r.data)
};
