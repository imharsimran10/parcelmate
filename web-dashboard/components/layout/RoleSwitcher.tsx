'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoleSwitcher() {
  const role = useAuthStore((state) => state.role);
  const switchRole = useAuthStore((state) => state.switchRole);
  const router = useRouter();

  const handleSwitch = () => {
    switchRole();
    // Refresh the page to update navigation
    router.refresh();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSwitch}
      className="gap-2"
    >
      <ArrowLeftRight className="h-4 w-4" />
      <span className="hidden sm:inline">
        Switch to {role === 'traveler' ? 'Sender' : 'Traveler'}
      </span>
      <span className="sm:hidden capitalize">{role === 'traveler' ? 'Sender' : 'Traveler'}</span>
    </Button>
  );
}
