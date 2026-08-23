import apiClient from "./client";

export const getPromoCodes = () => apiClient.get("/promocodes");
export const createPromoCode = (data) => apiClient.post("/promocodes", data);
export const updatePromoCode = (id, data) => apiClient.put(`/promocodes/${id}`, data);
export const deletePromoCode = (id) => apiClient.delete(`/promocodes/${id}`);