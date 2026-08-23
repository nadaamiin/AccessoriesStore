import apiClient from "./client";

export const getShipping = () => apiClient.get("/shipping");