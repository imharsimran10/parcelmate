'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Package, Calendar } from 'lucide-react';

interface ContactDetailsModalProps {
  open: boolean;
  onClose: () => void;
  type: 'parcel' | 'trip';
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
  };
  details: {
    from: string;
    to: string;
    date?: string;
    price: number;
    weight?: number;
  };
}

export default function ContactDetailsModal({
  open,
  onClose,
  type,
  contactPerson,
  details,
}: ContactDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Match Successful!
          </DialogTitle>
          <DialogDescription>
            {type === 'parcel'
              ? "You've accepted this delivery. Here are the sender's contact details:"
              : "You've requested this traveler. Here are their contact details:"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              🎉 Great! You can now contact each other to coordinate the {type === 'parcel' ? 'pickup and delivery' : 'delivery'}.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              Contact Information
            </h3>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{contactPerson.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a
                  href={`tel:${contactPerson.phone}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {contactPerson.phone}
                </a>
              </div>
            </div>

            {contactPerson.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a
                    href={`mailto:${contactPerson.email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {contactPerson.email}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Trip/Parcel Details */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">
              {type === 'parcel' ? 'Delivery' : 'Trip'} Details
            </h3>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-medium text-sm">{details.from} → {details.to}</p>
              </div>
            </div>

            {details.date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-sm">{details.date}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {details.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{details.weight}kg</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-bold text-green-600">₹{details.price}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
              📱 Next Steps:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Call or message to confirm details</li>
              <li>Agree on exact pickup time and location</li>
              <li>Exchange any additional information needed</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <a
            href={`tel:${contactPerson.phone}`}
            className="flex-1"
          >
            <Button className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
