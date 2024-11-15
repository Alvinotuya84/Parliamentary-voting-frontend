import { jwtDecode } from "jwt-decode";
import { User } from "@/types/auth";

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setStoredToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const removeStoredToken = () => {
  localStorage.removeItem("token");
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = (token: string): User | null => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
