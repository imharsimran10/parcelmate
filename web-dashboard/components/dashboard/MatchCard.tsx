'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Match } from '@/types';
import { MapPin, Calendar, Package, IndianRupee, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

interface MatchCardProps {
  match: Match;
  onAccept?: () => void;
  onReject?: () => void;
}

export default function MatchCard({ match, onAccept, onReject }: MatchCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Fair Match';
  };

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await api.post(`/matching/accept/${match.parcelId}/${match.tripId}`);
      setIsAccepted(true);
      if (onAccept) onAccept();
    } catch (error) {
      console.error('Failed to accept match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await api.post(`/matching/reject/${match.parcelId}/${match.tripId}`);
      if (onReject) onReject();
    } catch (error) {
      console.error('Failed to reject match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`${getMatchScoreColor(match.matchScore)} h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg`}
            >
              {match.matchScore}
            </div>
            <div>
              <CardTitle className="text-lg">{getMatchScoreLabel(match.matchScore)}</CardTitle>
              <CardDescription>Score: {match.matchScore}/100</CardDescription>
            </div>
          </div>
          {isAccepted && (
            <Badge variant="default" className="bg-green-500">
              Accepted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">Route</p>
              <p className="text-sm text-muted-foreground">
                {match.trip.origin.city} → {match.trip.destination.city}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">Departure Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(match.trip.departureDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">Parcel Details</p>
              <p className="text-sm text-muted-foreground">
                {match.parcel.weight}kg - {match.parcel.category}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm font-medium">Estimated Earnings</p>
              <p className="text-sm text-muted-foreground font-semibold text-green-600">
                ₹{match.estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {match.reasons && match.reasons.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Why this match?</p>
            </div>
            <ul className="space-y-1 ml-6">
              {match.reasons.map((reason, index) => (
                <li key={index} className="text-xs text-muted-foreground list-disc">
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Distance */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Distance from route</span>
          <span className="text-sm font-medium">{match.distance.toFixed(1)} km</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {!isAccepted ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleReject}
              disabled={isLoading}
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Accept Match'}
            </Button>
          </>
        ) : (
          <Button className="w-full" disabled>
            Match Accepted
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
