import axios from "axios";

const API = axios.create({
  baseURL: "http://57.154.241.153:8080/api",
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

    // ✅ global error handling
    if (error.response?.status === 500) {
      alert("Server error. Contact admin.");
    }

    return Promise.reject(error);
  }
);

export default API;

