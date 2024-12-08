'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendGAEvent } from '@next/third-parties/google';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Send conversion event to Google Analytics
    sendGAEvent({
      event: 'purchase',
      value: 10, // Monthly subscription price
      currency: 'USD',
      transaction_id: new Date().getTime().toString(),
    });

    // Redirect to /me after tracking
    router.replace('/me');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Processing...</div>
    </div>
  );
}
