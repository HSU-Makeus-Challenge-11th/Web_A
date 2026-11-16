# 선택 미션 수행 기록

## 1. invalidateQueries와 setQueryData 비교

실제 화면에서는 로그인과 평점 변경 후 `invalidateQueries`를 사용하고, 내 정보 수정과 즐겨찾기 변경 후에는 `setQueryData`를 사용했다.
또한 같은 내 정보 수정 요청에 두 방식을 각각 적용한 모의 테스트로 추가 조회와 구독 데이터의 변화를 비교했다.

### invalidateQueries

```tsx
await queryClient.invalidateQueries({
  queryKey: ["ratings", accessToken, memberId],
});
```

평점 변경 성공 후 회원 평점 목록을 무효화한다. 화면에서 사용하는 활성 쿼리는 다시 조회해 서버의 최신 결과를 반영한다.

### setQueryData

```tsx
queryClient.setQueryData<MemberInfo>(
  ["members", "me"],
  response.result,
);
```

내 정보 수정 응답에는 최신 이메일, 닉네임, 가입 시각이 포함되어 있으므로 응답을 조회 캐시에 바로 저장한다.
이 캐시를 사용하는 내 정보 화면과 수정 화면은 저장된 데이터를 공유한다.
이 처리는 성공 응답 이후에 실행되므로 요청 성공 전에 화면을 바꾸는 낙관적 업데이트와는 다르다.

### 비교 결과

동일한 `PATCH /members/me` 요청과 5분의 staleTime을 설정한 쿼리를 기준으로 테스트했다.
캐시에는 기존 닉네임 `before`가 있고, 수정된 닉네임은 `after`인 상황이다.

| 구분 | invalidateQueries | setQueryData |
| --- | --- | --- |
| 수정 이후 요청 | PATCH → GET | PATCH만 발생 |
| 활성 쿼리의 추가 GET | 1회 | 0회 |
| 데이터 갱신 시점 | 추가 GET 응답이 도착한 뒤 | PATCH 성공 응답으로 캐시를 바꿀 때 |
| 기다리는 동안 데이터 | 기존 닉네임 before 유지 | 수정 응답의 after로 변경 |
| 조회 상태 | isFetching=true, 기존 캐시가 있어 isLoading=false | 추가 조회를 시작하지 않음 |
| 비활성 쿼리 | 즉시 요청하지 않고 stale 처리 | 캐시 값을 즉시 변경 |

비활성 쿼리는 무효화 직후 GET이 발생하지 않고, 활성화된 observer가 연결될 때 GET이 발생하는 것도 확인했다.
`setQueryData` 이후 새 observer를 연결했을 때에는 5분의 staleTime 안에서 추가 GET 없이 수정 데이터를 사용했다.
이 결과는 모의 fetch와 실제 QueryClient·QueryObserver로 확인한 결과이며, 브라우저 Network 탭에서 실서버 요청을 검증한 결과는 아니다.

### 선택 기준

- `invalidateQueries`: 변경 응답에 최신 데이터가 없거나, 서버가 계산하는 값과 연관 목록까지 다시 확인해야 할 때 사용한다. 이 프로젝트에서는 평점 변경 후 목록 갱신에 적용했다.
- `setQueryData`: 수정 응답이 조회 데이터와 같은 형태이거나, 변경 결과를 확실하게 계산할 수 있을 때 사용한다. 이 프로젝트에서는 내 정보 수정 응답과 즐겨찾기 변경 결과를 캐시에 반영했다.
- `setQueryData` 자체는 추가 요청을 발생시키지 않지만, 이후 staleTime 만료나 별도의 무효화·재조회 설정에 따라 요청이 발생할 수 있다.

## 2. mutationOptions 리팩터링

로그인, 회원가입, 즐겨찾기, 내 정보 수정의 `mutationKey`와 `mutationFn`을 `src/mutations`의 옵션 함수로 분리했다.
알림·페이지 이동·캐시 갱신은 각 훅에서 처리한다.

```tsx
import { mutationOptions } from "@tanstack/react-query";
import { login } from "../api/auth/login";
import { signup } from "../api/members/signup";

export function loginMutationOptions() {
  return mutationOptions({
    mutationKey: ["auth", "login"],
    mutationFn: login,
  });
}

export function signupMutationOptions() {
  return mutationOptions({
    mutationKey: ["members", "signup"],
    mutationFn: signup,
  });
}
```

훅에서는 옵션을 펼쳐 사용하고 화면에 필요한 처리를 추가했다.

```tsx
return useMutation({
  ...signupMutationOptions(),
  onSuccess: (response) => {
    alert(response.message);
  },
  onError: () => {
    alert("회원가입에 실패했어요. 다시 시도해 주세요.");
  },
});
```

요청 설정을 재사용하면서 요청 변수와 응답의 타입 추론을 유지할 수 있다.
공유 옵션을 MutationObserver에서도 사용해 로그인·회원가입·즐겨찾기 요청이 정상 실행되는지 테스트했다.

## 3. 최종 확인

- `pnpm test`: 모의 요청 및 캐시 동작 테스트 16개 통과.
- `pnpm build`: TypeScript 검사 및 프로덕션 빌드 통과.
- `pnpm lint`: ESLint 검사 통과.
- 실제 백엔드를 통한 브라우저 동작 검증은 수행하지 않았다.
- 즐겨찾기는 백엔드 API가 없어 가정한 계약으로 프론트와 모의 테스트만 구현했다.

참고: [TanStack Query mutationOptions](https://tanstack.com/query/latest/docs/framework/react/reference/functions/mutationOptions), [Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
