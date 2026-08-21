import apiClient from "./client";

export const getAllOrders = () => apiClient.get("/orders");
export const updateOrderStatus = (id, status, note) =>
  apiClient.put(`/orders/${id}/status`, { status, note });