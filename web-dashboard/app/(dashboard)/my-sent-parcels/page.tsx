'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Package, Phone, Mail, MessageSquare, Calendar, Weight, IndianRupee, Plane } from 'lucide-react';
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

export default function MySentParcelsPage() {
  const [sentParcels, setSentParcels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, inTransit: 0, delivered: 0, totalSpent: 0 });

  useEffect(() => {
    fetchSentParcels();
  }, []);

  const fetchSentParcels = async () => {
    try {
      const response = await api.get('/parcels/my-sent-parcels');
      const parcels = response.data?.data || response.data || [];
      setSentParcels(parcels);

      const total = parcels.length;
      const inTransit = parcels.filter((p: any) => ['MATCHED', 'PICKED_UP', 'IN_TRANSIT'].includes(p.status)).length;
      const delivered = parcels.filter((p: any) => p.status === 'DELIVERED').length;
      const totalSpent = parcels.reduce((sum: number, p: any) => sum + (p.offeredPrice || 0), 0);

      setStats({ total, inTransit, delivered, totalSpent });
    } catch (error) {
      console.error('Failed to fetch sent parcels:', error);
      toast.error('Failed to load sent parcels');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-3xl font-bold tracking-tight">My Sent Parcels</h2><p className="text-muted-foreground mt-2">Track all parcels you're sending through travelers</p></div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Parcels</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">In Transit</CardTitle><Plane className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inTransit}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Delivered</CardTitle><Package className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.delivered}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Spent</CardTitle><IndianRupee className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold text-primary">₹{stats.totalSpent}</div></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>All Sent Parcels ({sentParcels.length})</CardTitle><CardDescription>Your parcels being delivered by travelers</CardDescription></CardHeader><CardContent>{sentParcels.length === 0 ? (<div className="text-center py-12 text-muted-foreground"><Package className="h-16 w-16 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium">No matched parcels yet</p><p className="text-sm mt-2">Create a parcel and match with travelers to get started</p></div>) : (<div className="space-y-4">{sentParcels.map((parcel) => (<Card key={parcel.id} className="border-l-4 border-l-green-500"><CardContent className="pt-6"><div className="space-y-4"><div className="flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-2"><h3 className="font-semibold text-lg">{parcel.title}</h3><Badge className={statusColors[parcel.status]}>{statusLabels[parcel.status]}</Badge></div><div className="grid gap-2 text-sm"><div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /><div><p className="font-medium">From</p><p className="text-muted-foreground text-xs">{parcel.pickupAddress}</p></div></div><div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" /><div><p className="font-medium">To</p><p className="text-muted-foreground text-xs">{parcel.deliveryAddress}</p></div></div><div className="flex items-center gap-4 pt-2"><div className="flex items-center gap-1"><Weight className="h-4 w-4 text-muted-foreground" /><span>{parcel.weight}kg</span></div><div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{format(new Date(parcel.pickupTimeStart), 'MMM d, yyyy')}</span></div></div></div></div><div className="text-right"><p className="text-2xl font-bold text-primary">₹{parcel.offeredPrice}</p><p className="text-xs text-muted-foreground mt-1">Recipient: {parcel.recipientName}</p></div></div><div className="border-t pt-4"><div className="flex items-center gap-3 mb-3"><Avatar className="h-10 w-10"><AvatarImage src={parcel.trip?.user?.profilePhoto} /><AvatarFallback>{parcel.trip?.user?.firstName?.[0]}{parcel.trip?.user?.lastName?.[0]}</AvatarFallback></Avatar><div className="flex-1"><p className="font-semibold text-sm">Traveler: {parcel.trip?.user?.firstName} {parcel.trip?.user?.lastName}</p><p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Plane className="h-3 w-3" />Trip: {parcel.trip?.originAddress?.split(',')[0]} → {parcel.trip?.destAddress?.split(',')[0]}</p><div className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Phone className="h-3 w-3" /><a href={`tel:${parcel.trip?.user?.phone}`} className="text-blue-600 hover:underline">{parcel.trip?.user?.phone}</a></div></div></div><div className="flex gap-2"><Link href={`/parcels/${parcel.id}`} className="flex-1"><Button variant="outline" size="sm" className="w-full">View Details</Button></Link><Link href="/messages" className="flex-1"><Button size="sm" className="w-full"><MessageSquare className="mr-2 h-4 w-4" />Message Traveler</Button></Link></div></div></div></CardContent></Card>))}</div>)}</CardContent></Card>
    </div>
  );
}
