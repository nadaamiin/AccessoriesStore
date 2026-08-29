import apiClient from "./client";

export const getProducts = () => apiClient.get("/products");
export const getProduct = (id) => apiClient.get(`/products/${id}`);
export const validateProducts = (productIds) =>
  api.post("/products/validate", { productIds });