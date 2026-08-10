import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/modules/auth/types/auth.types";

type PermissionType = "module" | "menu" | "api";

export function hasPermission(
  token: string,
  permission: string,
  type: PermissionType = "api"
): boolean {
  if (!token) return false;

  let payload: JwtPayload;

  try {
    payload = jwtDecode<JwtPayload>(token);
  } catch (e) {
    console.error("Invalid token", e);
    return false;
  }

  if (!payload.permissions) return false;

  let parsedPermissions: any[];

  try {
    parsedPermissions = JSON.parse(payload.permissions);
  } catch (e) {
    console.error("Invalid permissions format", e);
    return false;
  }

  // MODULE CHECK
  if (type === "module") {
    return parsedPermissions.some((mod) => mod.Key === permission);
  }

  // MENU CHECK
  if (type === "menu") {
    return parsedPermissions.some((mod) =>
      mod.Menus?.some((menu: any) => menu.Key === permission)
    );
  }

  // API CHECK
  if (type === "api") {
    return parsedPermissions.some((mod) =>
      mod.Menus?.some((menu: any) =>
        menu.Apis?.includes(permission)
      )
    );
  }

  return false;
}

export function hasRole(token: string, expectedRole: string): boolean {
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.role === expectedRole;
  } catch (e) {
    console.error("Invalid token", e);
    return false;
  }
}