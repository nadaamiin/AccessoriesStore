import apiClient from "./client";

export const getAnnouncement = () => apiClient.get("/announcement");