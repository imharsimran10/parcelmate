import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trip } from '@/types';
import { MapPin, Calendar, Package, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  matched: 'bg-blue-500',
  in_transit: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-gray-500',
  DRAFT: 'bg-gray-400',
  PUBLISHED: 'bg-yellow-500',
  IN_PROGRESS: 'bg-purple-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  matched: 'Matched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function TripCard({ trip }: TripCardProps) {
  const status = (trip as any).status || trip.status;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {(trip as any).originAddress || trip.origin?.city || 'N/A'} → {(trip as any).destAddress || trip.destination?.city || 'N/A'}
          </CardTitle>
          <Badge className={statusColors[status] || 'bg-gray-400'}>
            {statusLabels[status] || status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {(trip as any).originAddress || trip.origin?.country || 'N/A'} → {(trip as any).destAddress || trip.destination?.country || 'N/A'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {format(new Date((trip as any).departureTime || trip.departureDate), 'MMM dd, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Capacity: {(trip as any).maxWeight || trip.availableCapacity} kg
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            ₹{(trip as any).basePricePerKg || trip.pricePerKg}/kg
          </span>
        </div>

        {trip.matchedParcels && trip.matchedParcels.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">
              {trip.matchedParcels.length} Parcel{trip.matchedParcels.length > 1 ? 's' : ''} Matched
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Link href={`/trips/${trip.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        {trip.status === 'pending' && (
          <Link href={`/trips/${trip.id}/edit`} className="flex-1">
            <Button variant="default" className="w-full">
              Edit
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
