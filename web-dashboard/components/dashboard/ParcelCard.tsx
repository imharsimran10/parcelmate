import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Parcel } from '@/types';
import { MapPin, Package, IndianRupee, Weight } from 'lucide-react';

interface ParcelCardProps {
  parcel: Parcel;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  matched: 'bg-blue-500',
  in_transit: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-gray-500',
  DRAFT: 'bg-gray-400',
  REQUESTING: 'bg-yellow-500',
  MATCHED: 'bg-blue-500',
  PICKED_UP: 'bg-indigo-500',
  IN_TRANSIT: 'bg-purple-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
  DISPUTED: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  matched: 'Matched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  DRAFT: 'Draft',
  REQUESTING: 'Requesting',
  MATCHED: 'Matched',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

export default function ParcelCard({ parcel }: ParcelCardProps) {
  const status = (parcel as any).status || parcel.status;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">
            {(parcel as any).title || parcel.description || 'Parcel'}
          </CardTitle>
          <Badge className={statusColors[status] || 'bg-gray-400'}>
            {statusLabels[status] || status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">From: {(parcel as any).pickupAddress || parcel.pickupLocation?.city || 'N/A'}</p>
            <p className="font-medium">To: {(parcel as any).deliveryAddress || parcel.deliveryLocation?.city || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Weight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Weight: {parcel.weight} kg
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Category: {parcel.category}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground font-semibold">
            ₹{parcel.offeredPrice.toFixed(2)}
          </span>
        </div>

        {parcel.matchedTrip && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium text-green-600">
              Matched with Trip
            </p>
          </div>
        )}

        {parcel.trackingNumber && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Tracking: {parcel.trackingNumber}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Link href={`/parcels/${parcel.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {parcel.status === 'pending' && (
          <Link href={`/parcels/${parcel.id}/edit`} className="flex-1">
            <Button variant="default" className="w-full">
              Edit
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
