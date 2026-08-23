import apiClient from "./client";

export const createOrder = (data) => apiClient.post("/orders", data);