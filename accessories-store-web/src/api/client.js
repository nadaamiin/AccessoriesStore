import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://localhost:7113/api",
});

export default apiClient;