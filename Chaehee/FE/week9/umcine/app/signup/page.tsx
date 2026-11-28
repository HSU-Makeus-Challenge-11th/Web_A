import type { Metadata } from 'next';
import { SignupPage } from '../../screens/auth/signup-page';

export const metadata: Metadata = {
  title: '회원가입',
};

export default function Signup() {
  return <SignupPage />;
}
