// Only used to select the member endpoint. The server still validates the token.
export function getTokenMemberId(accessToken: string | null): number | undefined {
  if (!accessToken) return undefined;
  try {
    const payload = accessToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(normalized)) as Record<string, unknown>;
    const value = claims.sub;
    if (typeof value !== "number" && typeof value !== "string") return undefined;
    const memberId = Number(value);
    return Number.isSafeInteger(memberId) && memberId > 0 ? memberId : undefined;
  } catch {
    return undefined;
  }
}
