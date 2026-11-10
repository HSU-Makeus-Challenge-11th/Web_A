import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../../../pages/members/my-page";

export const Route = createFileRoute("/(auth-required)/my/")({
  component: MyPage,
});
