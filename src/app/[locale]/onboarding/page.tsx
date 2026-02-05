'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export default function Onboarding() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!session && !isPending) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      const userId = session.user.id;
      const email = session.user.email;

      fetch('/api/tenant/setup', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email })
      })
        .then(res => res.json())
        .then(data => {
          if (data.tenantId) {
            router.push('/dashboard');
          } else {
            console.error('Failed to setup tenant:', data.error);
            router.push('/error');
          }
        })
        .catch(err => {
          console.error('Tenant setup error:', err);
          router.push('/error');
        });
    }
  }, [session, isPending, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Setting up your inventory...</p>
      </div>
    </div>
  );
}
