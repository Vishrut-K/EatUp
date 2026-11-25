import { axiosClient } from "./axiosClient";

export const groupOrderApi = {
  create: (payload = {}) => axiosClient.post("/group-orders", payload).then((r) => r.data),
  get: (roomCode) => axiosClient.get(`/group-orders/${roomCode}`).then((r) => r.data),
  join: (roomCode) => axiosClient.post(`/group-orders/${roomCode}/join`).then((r) => r.data),
  leave: (roomCode) => axiosClient.post(`/group-orders/${roomCode}/leave`).then((r) => r.data),
  addItem: (roomCode, payload) => axiosClient.post(`/group-orders/${roomCode}/items`, payload).then((r) => r.data),
  updateQty: (roomCode, dishId, payload) =>
    axiosClient.patch(`/group-orders/${roomCode}/items/${dishId}`, payload).then((r) => r.data),
  toggleLock: (roomCode, locked) =>
    axiosClient.patch(`/group-orders/${roomCode}/lock`, { locked }).then((r) => r.data),
  finalize: (roomCode, payload) =>
    axiosClient.post(`/group-orders/${roomCode}/finalize`, payload).then((r) => r.data)
};
