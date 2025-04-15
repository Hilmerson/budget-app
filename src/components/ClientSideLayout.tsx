'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Import client components dynamically
const DashboardSidebar = dynamic(() => import('./DashboardSidebar'), { ssr: false });
const ClientWrapper = dynamic(() => import('./ClientWrapper'), { ssr: false });

export default function ClientSideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Client-side wrapper for animations */}
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