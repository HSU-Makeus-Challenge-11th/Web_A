import { AuthGuard } from '../../components/auth/auth-guard';

export default function ProtectedLayout({ children }: LayoutProps<'/'>) {
  return <AuthGuard>{children}</AuthGuard>;
}
