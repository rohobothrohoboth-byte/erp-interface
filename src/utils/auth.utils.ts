import Cookies from "js-cookie";
import type { AuthTokens } from "../types/auth/auth.types";

export const getAccessToken = (): string | null => {
  // Try cookie first, then localStorage as fallback
  return Cookies.get("accessToken") || localStorage.getItem("accessToken") || null;
};

export const getExpiresAt = (): Date | null => {
  const expiresAtStr = Cookies.get("expiresAt") || localStorage.getItem("expiresAt");
  return expiresAtStr ? new Date(expiresAtStr) : null;
};

export const isAuthenticated = (): boolean => !!getAccessToken();

export const login = async (username: string, password: string): Promise<void> => {
  const tokens = await loginApi({ username, password }); // Adjust path as needed
  setTokens(tokens);
};

export const refresh = async (): Promise<void> => {
  const tokens = await refreshTokenApi(); // Adjust path as needed
  setTokens(tokens);
};

export const logout = (): void => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("expiresAt", { path: "/" });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expiresAt");
};

const setTokens = (tokens: AuthTokens): void => {
  const expiresDate = new Date(tokens.expiresDate);

  // Store in cookies
  Cookies.set("accessToken", tokens.accessToken, {
    expires: expiresDate,
    secure: import.meta.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  Cookies.set("expiresAt", tokens.expiresDate, {
    expires: expiresDate,
    secure: import.meta.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  // Also store in localStorage as backup (for cross-domain requests)
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("expiresAt", tokens.expiresDate);
};