import apiClient from "./client";

export const sendContactMessage = (data) => apiClient.post("/contact", data);