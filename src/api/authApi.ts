import apiClient, { setAuthToken } from "./client";

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const token = res.data.token;
    setAuthToken(token);
    sessionStorage.setItem("token", token);
    return res.data;
  },
};
