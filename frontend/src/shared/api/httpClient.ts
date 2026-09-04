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
  const [companySlug, projectSlug] = window.location.pathname.split("/").filter(Boolean);
  if (companySlug && companySlug !== "platform") {
    config.headers["X-Company-Slug"] = companySlug;
    if (projectSlug) {
      config.headers["X-Project-Slug"] = projectSlug;
    }
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
