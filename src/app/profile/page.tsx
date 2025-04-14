import { Metadata } from 'next';
import UserProfile from '@/components/UserProfile';

export const metadata: Metadata = {
  title: 'User Profile | Finny',
  description: 'View and customize your Finny profile settings',
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen">
      <UserProfile />
    </main>
  );
} 