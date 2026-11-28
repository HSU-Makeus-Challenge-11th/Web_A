import { umcClient } from "../umc-client";
import type { MemberRating } from "./models";

type GetMemberRatingsResponse = MemberRating[];

function getMemberRatings(memberId: number) {
  return umcClient
    .get(`members/${memberId}/ratings`)
    .json<GetMemberRatingsResponse>();
}

export { getMemberRatings, type GetMemberRatingsResponse };
