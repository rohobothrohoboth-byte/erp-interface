// ── Query key factory ──────────────────────────────────────────────────────
export const profileKeys = {
  all: ["profile"] as const,
  photo: () => [...profileKeys.all, "photo"] as const,
  info: () => [...profileKeys.all, "info"] as const,
  card: () => [...profileKeys.all, "card"] as const,
  basic: () => [...profileKeys.all, "basic"] as const,
  bio: () => [...profileKeys.all, "bio"] as const,
  emContact: () => [...profileKeys.all, "emContact"] as const,
  family: () => [...profileKeys.all, "family"] as const,
  gurantor: () => [...profileKeys.all, "gurantor"] as const,
  leaveBalance: () => [...profileKeys.all, "leaveBalance"] as const,
} as const;