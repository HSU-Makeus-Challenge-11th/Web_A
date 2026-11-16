// NEXT_PUBLIC 변수만 브라우저 번들에 포함해요. TMDB 토큰은 Route Handler에서 읽어요.
export const env = { apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "" };
