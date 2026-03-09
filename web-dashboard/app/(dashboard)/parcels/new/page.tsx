'use client';

import ParcelForm from '@/components/forms/ParcelForm';

export default function NewParcelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Parcel</h2>
        <p className="text-muted-foreground mt-2">
          Request delivery for your parcel with travelers heading your way
        </p>
      </div>

      <ParcelForm />
    </div>
  );
}
