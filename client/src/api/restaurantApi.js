import { axiosClient } from "./axiosClient";

export const restaurantApi = {
  getCategories: () => axiosClient.get("/restaurants/categories").then((r) => r.data),
  getAll: (params = {}) => axiosClient.get("/restaurants", { params }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/restaurants/${id}`).then((r) => r.data)
};
