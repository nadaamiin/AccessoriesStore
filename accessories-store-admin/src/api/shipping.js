import apiClient from "./client";

export const getShipping = () => apiClient.get("/shipping");
export const updateShipping = (data) => apiClient.put("/shipping", data);