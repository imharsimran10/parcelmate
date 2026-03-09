'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Package, Phone, Mail, MessageSquare, Calendar, Weight, IndianRupee, User, Truck } from 'lucide-react';
import DeliveryConfirmationModal from '@/components/delivery/DeliveryConfirmationModal';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { format } from 'date-fns';

const statusColors: any = {
  MATCHED: 'bg-blue-500',
  PICKED_UP: 'bg-purple-500',
  IN_TRANSIT: 'bg-orange-500',
  DELIVERED: 'bg-green-500',
};

const statusLabels: any = {
  MATCHED: 'Matched',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
};

export default function MyDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, earnings: 0 });
  const [showDelivery, setShowDelivery] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<any>(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/parcels/my-deliveries');
      const parcels = response.data?.data || response.data || [];
      setDeliveries(parcels);

      const total = parcels.length;
      const inProgress = parcels.filter((p: any) => ['MATCHED', 'PICKED_UP', 'IN_TRANSIT'].includes(p.status)).length;
      const completed = parcels.filter((p: any) => p.status === 'DELIVERED').length;
      const earnings = parcels.filter((p: any) => p.status === 'DELIVERED').reduce((sum: number, p: any) => sum + (p.offeredPrice || 0), 0);

      setStats({ total, inProgress, completed, earnings });
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold tracking-tight">My Deliveries</h2><p className="text-muted-foreground mt-2">All parcels you're carrying on your trips</p></div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Deliveries</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Progress</CardTitle><Package className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inProgress}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle><Package className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Earnings</CardTitle><IndianRupee className="h-4 w-4 text-green-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">₹{stats.earnings}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Parcels to Deliver ({deliveries.length})</CardTitle>
          <CardDescription>Manage your delivery commitments</CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No deliveries yet</p>
              <p className="text-sm mt-2">Accept parcels from Find Parcels page to start earning</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((parcel) => {
                const canManageDelivery = ['MATCHED', 'PICKED_UP', 'IN_TRANSIT'].includes(parcel.status);

                return (
                  <Card key={parcel.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{parcel.title}</h3>
                              <Badge className={statusColors[parcel.status]}>{statusLabels[parcel.status]}</Badge>
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Pickup</p>
                                  <p className="text-muted-foreground text-xs">{parcel.pickupAddress}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">Delivery</p>
                                  <p className="text-muted-foreground text-xs">{parcel.deliveryAddress}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-1">
                                  <Weight className="h-4 w-4 text-muted-foreground" />
                                  <span>{parcel.weight}kg</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{format(new Date(parcel.pickupTimeStart), 'MMM d')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">₹{parcel.offeredPrice}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Trip: {parcel.trip?.originAddress?.split(',')[0]} → {parcel.trip?.destAddress?.split(',')[0]}
                            </p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={parcel.sender?.profilePhoto} />
                              <AvatarFallback>{parcel.sender?.firstName?.[0]}{parcel.sender?.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-sm">Sender: {parcel.sender?.firstName} {parcel.sender?.lastName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <a href={`tel:${parcel.sender?.phone}`} className="text-blue-600 hover:underline">
                                  {parcel.sender?.phone}
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {canManageDelivery && (
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedParcel(parcel);
                                  setShowDelivery(true);
                                }}
                              >
                                <Truck className="mr-2 h-4 w-4" />
                                Manage Delivery
                              </Button>
                            )}
                            <Link href={`/parcels/${parcel.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                View Details
                              </Button>
                            </Link>
                            <Link href="/messages" className="flex-1">
                              <Button size="sm" variant="outline" className="w-full">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Confirmation Modal */}
      {selectedParcel && (
        <DeliveryConfirmationModal
          open={showDelivery}
          onClose={() => {
            setShowDelivery(false);
            setSelectedParcel(null);
          }}
          parcel={selectedParcel}
          onSuccess={() => {
            fetchDeliveries();
          }}
        />
      )}
    </div>
  );
}
