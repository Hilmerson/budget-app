import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dynamic from 'next/dynamic';

// Import client components dynamically to avoid RSC errors
const DashboardSidebar = dynamic(() => import('@/components/DashboardSidebar'), { ssr: false });
const ClientWrapper = dynamic(() => import('@/components/ClientWrapper'), { ssr: false });

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Client-side wrapper for animations and state that needs to run in the client */}
      <ClientWrapper />
      
      <div className="flex flex-col md:flex-row">
        {/* The sidebar is shared across all dashboard pages */}
        <DashboardSidebar />
        
        {/* Main content */}
        <div className="flex-1 p-6 md:ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 