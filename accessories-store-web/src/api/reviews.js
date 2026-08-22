import apiClient from "./client";

export const submitReview = (formData) =>
  apiClient.post("/reviews", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getApprovedReviews = (productId) =>
  apiClient.get("/reviews/approved", { params: productId ? { productId } : {} });