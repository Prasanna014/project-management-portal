import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ REQUEST INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    console.log("API REQUEST:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", error?.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default API;

