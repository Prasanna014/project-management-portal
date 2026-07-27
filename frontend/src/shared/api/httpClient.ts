import axios from "axios";
import { env } from "@shared/config/env";
import { authToken } from "@shared/api/authToken";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      authToken.clear();
      window.dispatchEvent(new Event("app:unauthorized"));
    }
    return Promise.reject(error);
  }
);
