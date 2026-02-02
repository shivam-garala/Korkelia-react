'use client';

import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const isAdminRoute = () => {
  if (typeof window === "undefined") return false;
  const path = window.location?.pathname ?? "";
  return path.startsWith("/dashboard") || path === "/login";
};

const isMutationMethod = (method) => {
  const normalized = String(method ?? "").toLowerCase();
  return normalized === "post" || normalized === "put" || normalized === "patch" || normalized === "delete";
};

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

    if (config.headers) {
      const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
      if (!config.headers["Content-Type"] && !isFormData) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    const message = response?.data?.message;
    const success = response?.data?.success;
    const method = response?.config?.method;
    if (
      isAdminRoute() &&
      isMutationMethod(method) &&
      success === true &&
      typeof message === "string" &&
      message.trim()
    ) {
      toast.success(message);
    }
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const method = error?.config?.method;

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
      if (isAdminRoute() && isMutationMethod(method) && message) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
