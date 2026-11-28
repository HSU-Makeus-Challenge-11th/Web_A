import type { Metadata } from 'next';
import { LoginPage } from '../../screens/auth/login-page';

export const metadata: Metadata = {
  title: '로그인',
};

export default function Login() {
  return <LoginPage />;
}
