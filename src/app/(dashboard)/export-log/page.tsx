'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/modules/auth/stores/AuthContext';
import { ExportDashboard } from '@/modules/export-log/components/ExportDashboard';

export default function ExportLogPage() {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && user?.role?.toLowerCase() !== 'admin') {
      router.replace('/overview');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role?.toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <ExportDashboard />
    </div>
  );
}
