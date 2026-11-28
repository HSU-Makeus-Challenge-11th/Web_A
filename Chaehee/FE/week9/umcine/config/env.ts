const tmdbApiBaseUrl = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL;
const tmdbAccessToken = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const umcApiBaseUrl = process.env.NEXT_PUBLIC_UMC_API_BASE_URL;

if (!tmdbApiBaseUrl || !tmdbAccessToken) {
  throw new Error("TMDB 환경 변수가 필요해요.");
}

if (!umcApiBaseUrl) {
  throw new Error("UMC 백엔드 환경 변수가 필요해요.");
}

export const env = {
  tmdbApiBaseUrl,
  tmdbAccessToken,
  umcApiBaseUrl,
};
