export const isExpiringSoon = (
    expiresAt: Date,
    skewSeconds = 30
): boolean => {
    return expiresAt.getTime() - Date.now() < skewSeconds * 1000;
};
