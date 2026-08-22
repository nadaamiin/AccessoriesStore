import apiClient from "./client";

export const getAllReviews = () => apiClient.get("/reviews");
export const approveReview = (id) => apiClient.put(`/reviews/${id}/approve`);
export const deleteReview = (id) => apiClient.delete(`/reviews/${id}`);