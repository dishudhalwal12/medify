"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Shell } from '@/components/layout/Shell';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !profileLoading && !user) {
      router.push('/login');
    }
  }, [user, loading, profileLoading, router]);

  if (loading || profileLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fcfaf4_0%,#f4eee4_100%)]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="mb-4 h-8 w-8 rounded-full bg-[#dcefe7]"></div>
          <div className="text-sm font-medium text-[#5f7a81]">
            {loading ? "Loading session..." : "Preparing your workspace..."}
          </div>
        </div>
      </div>
    );
  }

  return <Shell>{children}</Shell>;
}
