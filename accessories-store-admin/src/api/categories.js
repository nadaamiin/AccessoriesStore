import apiClient from "./client";

export const getCategories = () => apiClient.get("/categories");
export const createCategory = (data) => apiClient.post("/categories", data);