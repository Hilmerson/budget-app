import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }

  // This code will never execute, but is needed to satisfy TypeScript
  return null;
}
