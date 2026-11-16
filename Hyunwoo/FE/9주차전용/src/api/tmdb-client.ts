import ky from "ky";
export const tmdbClient = ky.create({ baseUrl: "/api/tmdb/" });
