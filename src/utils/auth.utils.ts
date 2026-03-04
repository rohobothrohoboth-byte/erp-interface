import Cookies from "js-cookie";
import { loginApi, refreshTokenApi } from "../services/auth.api"; // Adjust path as needed
import type { AuthTokens } from "../types/auth/auth.types";

export const getAccessToken = (): string | null => {
  return Cookies.get("accessToken") || null;
};

export const getExpiresAt = (): Date | null => {
  const expiresAtStr = Cookies.get("expiresAt");
  return expiresAtStr ? new Date(expiresAtStr) : null;
};

export const isAuthenticated = (): boolean => !!getAccessToken();

export const login = async (
  username: string,
  password: string
): Promise<void> => {
  const tokens = await loginApi({ username, password });
  setTokens(tokens);
};

export const refresh = async (): Promise<void> => {
  const tokens = await refreshTokenApi();
  setTokens(tokens);
};

export const logout = (): void => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("expiresAt", { path: "/" });
};

const setTokens = (tokens: AuthTokens): void => {
  const expiresDate = new Date(tokens.expiresDate);
  // Set cookie expiration to match token expiration
  Cookies.set("accessToken", tokens.accessToken, {
    expires: expiresDate,
    secure: import.meta.env.NODE_ENV === "production", // Secure in prod
    sameSite: "lax", // Changed from strict to lax for better compatibility
    path: "/",
  });
  Cookies.set("expiresAt", tokens.expiresDate, {
    expires: expiresDate,
    secure: import.meta.env.NODE_ENV === "production",
    sameSite: "lax", // Changed from strict to lax for better compatibility
    path: "/",
  });
};


