import { mutationOptions } from "@tanstack/react-query";
import { updateMe } from "../api/members/update-me";

export function updateMeMutationOptions() {
  return mutationOptions({
    mutationKey: ["members", "updateMe"],
    mutationFn: updateMe,
  });
}
