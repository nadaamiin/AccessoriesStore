import apiClient from "./client";

export const getContactMessages = () => apiClient.get("/contact");
export const updateContactMessageStatus = (id, status) =>
  apiClient.put(`/contact/${id}/status`, { status });