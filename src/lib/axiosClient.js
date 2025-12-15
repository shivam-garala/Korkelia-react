'use client';

import axios from "axios";
import Cookies from "js-cookie";

console.log(process.env.NEXT_PUBLIC_API_URL);

const axiosClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BASE_API_URL ??
    process.env.NEXT_BASE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401 || status === 440) {
      Cookies.remove("authToken");
      Cookies.remove("userName");
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    } else if (
      status === 400 ||
      status === 404 ||
      status === 409 ||
      status === 500
    ) {
      if (typeof window !== "undefined" && message) {
        // Swap to a toast library later; keep it simple and transparent for now.
        console.error("API error:", message);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
