import { LoginPage } from "@/screens/auth/login-page";
import { AuthGuard } from "@/components/auth-guard";
export default function Page() { return <AuthGuard guestOnly><LoginPage /></AuthGuard>; }
