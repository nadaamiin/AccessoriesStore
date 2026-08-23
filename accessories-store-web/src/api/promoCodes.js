import apiClient from "./client";

export const validatePromoCode = (code, subtotal) =>
  apiClient.post("/promocodes/validate", { code, subtotal });