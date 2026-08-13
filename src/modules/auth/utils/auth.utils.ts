import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const getAccessToken = (): string | null => {
  // Try cookie first, then localStorage as fallback
  return Cookies.get("accessToken") || localStorage.getItem("accessToken") || null;
};

// True when we still hold an access token whose JWT `exp` is in the future.
// Used to decide whether a failed token refresh should tear down the session:
// a spurious 401 from a single endpoint must NOT log out a still-valid session.
export const isAccessTokenValid = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return false;
    // 5s skew buffer so we don't treat a just-expiring token as valid.
    return exp * 1000 > Date.now() + 5000;
  } catch {
    return false;
  }
};

export const getExpiresAt = (): Date | null => {
  const expiresAtStr = Cookies.get("expiresAt") || localStorage.getItem("expiresAt");
  return expiresAtStr ? new Date(expiresAtStr) : null;
};

export const isAuthenticated = (): boolean => !!getAccessToken();

export const logout = (): void => {
  Cookies.remove("accessToken", { path: "/" });
  Cookies.remove("expiresAt", { path: "/" });
  localStorage.removeItem("accessToken");
  localStorage.removeItem("expiresAt");
};