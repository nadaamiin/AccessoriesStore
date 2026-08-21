import apiClient from "./client";

export const getProducts = () => apiClient.get("/products");
export const getAllProductsAdmin = () => apiClient.get("/products/admin/all");
export const getProduct = (id) => apiClient.get(`/products/${id}`);
export const createProduct = (data) => apiClient.post("/products", data);
export const updateProduct = (id, data) => apiClient.put(`/products/${id}`, data);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
export const uploadProductImage = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post(`/products/${id}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};