import ky from "ky";
import { env } from "../config/env";

export const umcClient = ky.create({
  baseUrl: `${env.umcApiBaseUrl}/`,
});
