import api from "./axios";

export const register = (data) => api.post("/auth/register", data);

export const login = async (data) => {
    const response = await api.post("/auth/login", data);
    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
    }
    return response.data;
};

export const refreshToken = (data) => api.post("/auth/token/refresh/", data);