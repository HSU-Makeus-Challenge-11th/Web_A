import { umcClient } from "../umc-client";
import type { AvailabilityCheckResponse } from "./models";

type CheckNicknameResponse = AvailabilityCheckResponse;

function checkNickname(nickname: string) {
  return umcClient
    .get(`members/nickname/${encodeURIComponent(nickname)}`)
    .json<CheckNicknameResponse>();
}

export { checkNickname, type CheckNicknameResponse };
