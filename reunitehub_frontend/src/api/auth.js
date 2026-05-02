import api from "./axios";

export const register = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const refreshToken = (data) => api.post("/auth/token/refresh", data);