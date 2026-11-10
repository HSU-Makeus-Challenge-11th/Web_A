import { umcClient } from "../umc-client";
import type { AvailabilityCheckResponse } from "./models";

type CheckEmailResponse = AvailabilityCheckResponse;

function checkEmail(email: string) {
  return umcClient
    .get(`members/email/${encodeURIComponent(email)}`)
    .json<CheckEmailResponse>();
}

export { checkEmail, type CheckEmailResponse };
