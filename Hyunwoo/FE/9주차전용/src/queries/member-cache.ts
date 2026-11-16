import type { QueryClient } from "@tanstack/react-query";
import type { MemberInfo } from "../api/members/me";

export const ME_QUERY_KEY = ["members", "me"] as const;

export function invalidateMeQuery(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
}

export function setMeQueryData(queryClient: QueryClient, member: MemberInfo) {
  queryClient.setQueryData<MemberInfo>(ME_QUERY_KEY, member);
}
