import { axiosClient } from "./axiosClient";

export const cartApi = {
  get: () => axiosClient.get("/cart").then((r) => r.data),
  addItem: (payload) => axiosClient.post("/cart/items", payload).then((r) => r.data),
  updateQty: (dishId, payload) => axiosClient.patch(`/cart/items/${dishId}`, payload).then((r) => r.data),
  clear: () => axiosClient.delete("/cart").then((r) => r.data),
  merge: (payload) => axiosClient.post("/cart/merge", payload).then((r) => r.data)
};
