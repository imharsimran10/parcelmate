'use client';

import TripForm from '@/components/forms/TripForm';

export default function NewTripPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Trip</h2>
        <p className="text-muted-foreground mt-2">
          Post your upcoming trip and earn money by delivering parcels
        </p>
      </div>

      <TripForm />
    </div>
  );
}
