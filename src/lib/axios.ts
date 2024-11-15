import axios from "axios";
import { siteConfig } from "@/config/site";

export const api = axios.create({
  baseURL: siteConfig.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
