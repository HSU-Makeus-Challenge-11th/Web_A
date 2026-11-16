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
