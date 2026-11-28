export function getMemberIdFromToken(accessToken: string | null): number | null {
  if (!accessToken) return null;

  try {
    const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { sub } = JSON.parse(atob(payload)) as { sub?: string | number };
    const memberId = Number(sub);
    return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
  } catch {
    return null;
  }
}
