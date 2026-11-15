import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMeMutationOptions } from "../mutations/member-mutations";
import { setMeQueryData } from "../queries/member-cache";

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...updateMeMutationOptions(),
    onSuccess: (response) => {
      setMeQueryData(queryClient, response.result);
      alert("내 정보 수정에 성공했어요.");
    },
    onError: () => {
      alert("내 정보 수정에 실패했어요. 다시 시도해 주세요.");
    },
  });
}
