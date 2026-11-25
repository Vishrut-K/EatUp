import { axiosClient } from "./axiosClient";

export const orderApi = {
  getAll: () => axiosClient.get("/orders").then((r) => r.data),
  getByNumber: (orderNumber) => axiosClient.get(`/orders/${orderNumber}`).then((r) => r.data),
  createSolo: (payload) => axiosClient.post("/orders", payload).then((r) => r.data),
  reorder: (orderNumber) => axiosClient.post(`/orders/${orderNumber}/reorder`).then((r) => r.data),
  updateSettlement: (orderNumber, payload) =>
    axiosClient.patch(`/orders/${orderNumber}/settlement`, payload).then((r) => r.data)
};
