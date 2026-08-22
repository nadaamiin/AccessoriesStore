import apiClient from "./client";

export const getAnnouncement = () => apiClient.get("/announcement");
export const updateAnnouncement = (data) => apiClient.put("/announcement", data);