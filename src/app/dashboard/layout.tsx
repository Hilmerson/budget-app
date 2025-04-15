import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ClientSideLayout from '@/components/ClientSideLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Let the client component handle the layout with dynamic imports
  return <ClientSideLayout>{children}</ClientSideLayout>;
} 