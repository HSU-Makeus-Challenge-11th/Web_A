import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { loginMutationOptions } from "../mutations/auth-mutations";
import { invalidateMeQuery } from "../queries/member-cache";
import { useAuthStore } from "../stores/auth-store";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    ...loginMutationOptions(),
    onSuccess: async (response) => {
      await queryClient.cancelQueries({ queryKey: ["members", "me"] });
      queryClient.removeQueries({ queryKey: ["members", "me"] });
      queryClient.removeQueries({ queryKey: ["favorites"] });
      queryClient.removeQueries({ queryKey: ["ratings"] });
      setAccessToken(response.result.accessToken);
      alert("로그인에 성공했어요.");
      void invalidateMeQuery(queryClient);
      void navigate({ to: "/" });
    },
    onError: () => {
      alert("로그인에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
