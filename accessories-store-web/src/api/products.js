import apiClient from "./client";

export const getProducts = () => apiClient.get("/products");
export const getProduct = (id) => apiClient.get(`/products/${id}`);
export const getPopularProducts = () => apiClient.get("/products/popular");
export const getRelatedProducts = (id) => apiClient.get(`/products/${id}/related`);

export const validateProducts = (productIds) =>
  apiClient.post("/products/validate", { productIds });
