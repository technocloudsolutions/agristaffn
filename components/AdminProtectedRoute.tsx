'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Spinner } from '@nextui-org/react';

export default function AdminProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAccess = async () => {
      if (!loading) {
        if (!user) {
          router.push('/');
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          if (!userData || (userData.role !== 'Admin' && userData.role !== 'DataEntry')) {
            router.push('/');
            return;
          }
        } catch (error) {
          console.error('Error checking user access:', error);
          router.push('/');
        }
      }
    };

    checkUserAccess();
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
} 