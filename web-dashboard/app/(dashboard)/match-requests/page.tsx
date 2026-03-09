'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Calendar, User, CheckCircle, XCircle } from 'lucide-react';
import ContactDetailsModal from '@/components/modals/ContactDetailsModal';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MatchRequest {
  id: string;
  requestType: string;
  createdAt: string;
  parcel: any;
  trip: any;
  requester: any;
}

export default function MatchRequestsPage() {
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [showApprovedMessage, setShowApprovedMessage] = useState(false);

  useEffect(() => {
    fetchMatchRequests();
  }, []);

  const fetchMatchRequests = async () => {
    try {
      const response = await api.get('/parcels/match-requests');
      const requests = response.data?.data || response.data || [];
      setMatchRequests(requests);

      // Check if user just came from a notification (show guidance)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('from') === 'notification') {
        setShowApprovedMessage(true);
        setTimeout(() => setShowApprovedMessage(false), 5000);
      }
    } catch (error) {
      console.error('Failed to fetch match requests:', error);
      toast.error('Failed to load match requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (matchRequest: MatchRequest) => {
    setProcessingId(matchRequest.id);
    try {
      const response = await api.post(`/parcels/match-requests/${matchRequest.id}/approve`);
      const matchedParcel = response.data?.data || response.data;

      toast.success('Match approved! You can now contact each other.');

      // Show contact details modal
      if (matchRequest.requestType === 'TRAVELER_REQUEST') {
        // Sender approved traveler's request
        setSelectedMatch({
          type: 'traveler',
          contactPerson: {
            name: `${matchRequest.trip.user.firstName} ${matchRequest.trip.user.lastName}`,
            phone: matchRequest.trip.user.phone || 'Not provided',
            email: matchRequest.trip.user.email,
          },
          details: {
            from: matchRequest.parcel.pickupAddress,
            to: matchRequest.parcel.deliveryAddress,
            date: format(new Date(matchRequest.trip.departureTime), 'PPP'),
            price: matchRequest.parcel.offeredPrice,
            weight: matchRequest.parcel.weight,
          },
        });
      } else {
        // Traveler approved sender's request
        setSelectedMatch({
          type: 'sender',
          contactPerson: {
            name: `${matchRequest.parcel.sender.firstName} ${matchRequest.parcel.sender.lastName}`,
            phone: matchRequest.parcel.recipientPhone || 'Not provided',
            email: matchRequest.parcel.recipientEmail,
          },
          details: {
            from: matchRequest.parcel.pickupAddress,
            to: matchRequest.parcel.deliveryAddress,
            date: format(new Date(matchRequest.parcel.pickupTimeStart), 'PPP'),
            price: matchRequest.parcel.offeredPrice,
            weight: matchRequest.parcel.weight,
          },
        });
      }
      setShowContactModal(true);

      // Refresh list
      fetchMatchRequests();
    } catch (error: any) {
      console.error('Failed to approve match:', error);
      toast.error(error.response?.data?.message || 'Failed to approve match');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (matchRequestId: string) => {
    setProcessingId(matchRequestId);
    try {
      await api.post(`/parcels/match-requests/${matchRequestId}/reject`);
      toast.success('Match request declined');
      fetchMatchRequests();
    } catch (error: any) {
      console.error('Failed to reject match:', error);
      toast.error(error.response?.data?.message || 'Failed to reject match');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Match Requests</h2>
        <p className="text-muted-foreground mt-2">
          Review and approve or decline incoming match requests
        </p>
      </div>

      {showApprovedMessage && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Request Approved Successfully!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                  The match has been confirmed. Check your parcel/trip details for contact information,
                  or use the Messages page to coordinate pickup and delivery.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({matchRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {matchRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No pending requests</p>
              <p className="text-sm mt-2">
                When someone requests to match with you, it will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matchRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-semibold">
                                {request.requester.firstName} {request.requester.lastName}
                              </p>
                              <Badge variant="outline">
                                {request.requestType === 'TRAVELER_REQUEST'
                                  ? 'Wants to deliver your parcel'
                                  : 'Wants you to deliver their parcel'}
                              </Badge>
                            </div>
                          </div>

                          <div className="pl-7 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{request.parcel.title}</span>
                              <span className="text-muted-foreground">
                                ({request.parcel.weight}kg)
                              </span>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">From</p>
                                <p>{request.parcel.pickupAddress}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">To</p>
                                <p>{request.parcel.deliveryAddress}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Requested {format(new Date(request.createdAt), 'PPp')}</span>
                              </div>
                              <p className="font-bold text-green-600">₹{request.parcel.offeredPrice}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleReject(request.id)}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id ? 'Declining...' : 'Decline'}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {processingId === request.id ? 'Approving...' : 'Approve'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Modal */}
      {selectedMatch && (
        <ContactDetailsModal
          open={showContactModal}
          onClose={() => setShowContactModal(false)}
          type={selectedMatch.type === 'traveler' ? 'trip' : 'parcel'}
          contactPerson={selectedMatch.contactPerson}
          details={selectedMatch.details}
        />
      )}
    </div>
  );
}
