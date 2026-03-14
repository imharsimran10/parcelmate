'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TripFormData } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { countries, getStatesByCountry, getCitiesByState } from '@/lib/location-data';

const tripSchema = z.object({
  // Origin address
  originStreet: z.string().optional(),
  originCity: z.string().min(1, 'Origin city is required'),
  originState: z.string().min(1, 'Origin state is required'),
  originCountry: z.string().min(1, 'Origin country is required'),

  // Destination address
  destinationStreet: z.string().optional(),
  destinationCity: z.string().min(1, 'Destination city is required'),
  destinationState: z.string().min(1, 'Destination state is required'),
  destinationCountry: z.string().min(1, 'Destination country is required'),

  departureDate: z.string().min(1, 'Departure date is required'),
  arrivalDate: z.string().optional(),
  availableCapacity: z.number().min(1, 'Capacity must be at least 1 kg').max(100),
  pricePerKg: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  initialData?: Partial<TripFormData>;
  tripId?: string;
}

export default function TripForm({ initialData, tripId }: TripFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location selection state
  const [originCountry, setOriginCountry] = useState('');
  const [originState, setOriginState] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [destinationState, setDestinationState] = useState('');
  const [originCitySelect, setOriginCitySelect] = useState('');
  const [destinationCitySelect, setDestinationCitySelect] = useState('');
  const [showOriginCityInput, setShowOriginCityInput] = useState(false);
  const [showDestinationCityInput, setShowDestinationCityInput] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      originStreet: '',
      originCity: '',
      originState: '',
      originCountry: '',
      destinationStreet: '',
      destinationCity: '',
      destinationState: '',
      destinationCountry: '',
      availableCapacity: initialData?.availableCapacity || 10,
      pricePerKg: initialData?.pricePerKg || 5,
      departureDate: initialData?.departureDate || '',
      arrivalDate: initialData?.arrivalDate || '',
      description: initialData?.description || '',
    },
  });

  const onSubmit = async (data: TripFormValues) => {
    setIsSubmitting(true);

    try {
      // Build full addresses from components
      const originAddress = [
        data.originStreet,
        data.originCity,
        data.originState,
        data.originCountry,
      ]
        .filter(Boolean)
        .join(', ');

      const destinationAddress = [
        data.destinationStreet,
        data.destinationCity,
        data.destinationState,
        data.destinationCountry,
      ]
        .filter(Boolean)
        .join(', ');

      // Transform data to match backend DTO
      const payload = {
        originAddress: originAddress,
        originLat: 0,
        originLng: 0,
        destAddress: destinationAddress,
        destLat: 0,
        destLng: 0,
        departureTime: data.departureDate,
        arrivalTime: data.arrivalDate || undefined,
        maxParcels: 5, // Default to 5 parcels
        maxWeight: data.availableCapacity,
        acceptedSizes: ['DOCUMENT', 'SMALL', 'MEDIUM'], // Accept all sizes by default
        basePricePerKg: data.pricePerKg,
        description: data.description || undefined,
      };

      let response;

      if (tripId) {
        // Update existing trip
        response = await api.put(`/trips/${tripId}`, payload);
        console.log('Update response:', response);
      } else {
        // Create new trip
        response = await api.post('/trips', payload);
        console.log('Create response:', response);
      }

      setIsSubmitting(false);

      if (tripId) {
        toast.success('Trip updated successfully!');
        router.push('/trips');
      } else {
        toast.success('Trip created successfully!');

        setTimeout(() => {
          if (response.data?.data?.id) {
            router.push(`/trips/${response.data.data.id}`);
          } else if (response.data?.id) {
            router.push(`/trips/${response.data.id}`);
          } else {
            router.push('/trips');
          }
        }, 500);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error saving trip:', err);
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const message = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || 'Failed to save trip';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Origin</CardTitle>
          <CardDescription>Where will you start your journey?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originStreet">Street Address (Optional)</Label>
            <Input
              id="originStreet"
              type="text"
              placeholder="123 Main Street"
              {...register('originStreet')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="originCountry">Country *</Label>
              <Select
                value={originCountry}
                onValueChange={(value) => {
                  setOriginCountry(value);
                  setOriginState('');
                  setValue('originCountry', value);
                  setValue('originState', '');
                  setValue('originCity', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.originCountry && (
                <p className="text-sm text-destructive">{errors.originCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originState">State/Province *</Label>
              <Select
                value={originState}
                onValueChange={(value) => {
                  setOriginState(value);
                  setValue('originState', value);
                  setValue('originCity', '');
                }}
                disabled={!originCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={originCountry ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(originCountry).map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.originState && (
                <p className="text-sm text-destructive">{errors.originState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="originCity">City *</Label>
              {!showOriginCityInput ? (
                <Select
                  value={originCitySelect}
                  onValueChange={(value) => {
                    setOriginCitySelect(value);
                    if (value === 'Other') {
                      setShowOriginCityInput(true);
                      setValue('originCity', '');
                    } else {
                      setValue('originCity', value);
                    }
                  }}
                  disabled={!originState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={originState ? "Select city" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesByState(originCountry, originState).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="originCity"
                    type="text"
                    placeholder="Enter your city name"
                    {...register('originCity')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowOriginCityInput(false);
                      setOriginCitySelect('');
                      setValue('originCity', '');
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    ← Back to list
                  </button>
                </div>
              )}
              {errors.originCity && (
                <p className="text-sm text-destructive">{errors.originCity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destination</CardTitle>
          <CardDescription>Where are you heading?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destinationStreet">Street Address (Optional)</Label>
            <Input
              id="destinationStreet"
              type="text"
              placeholder="456 Park Avenue"
              {...register('destinationStreet')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destinationCountry">Country *</Label>
              <Select
                value={destinationCountry}
                onValueChange={(value) => {
                  setDestinationCountry(value);
                  setDestinationState('');
                  setValue('destinationCountry', value);
                  setValue('destinationState', '');
                  setValue('destinationCity', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.destinationCountry && (
                <p className="text-sm text-destructive">{errors.destinationCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationState">State/Province *</Label>
              <Select
                value={destinationState}
                onValueChange={(value) => {
                  setDestinationState(value);
                  setValue('destinationState', value);
                  setValue('destinationCity', '');
                }}
                disabled={!destinationCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={destinationCountry ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(destinationCountry).map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.destinationState && (
                <p className="text-sm text-destructive">{errors.destinationState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destinationCity">City *</Label>
              {!showDestinationCityInput ? (
                <Select
                  value={destinationCitySelect}
                  onValueChange={(value) => {
                    setDestinationCitySelect(value);
                    if (value === 'Other') {
                      setShowDestinationCityInput(true);
                      setValue('destinationCity', '');
                    } else {
                      setValue('destinationCity', value);
                    }
                  }}
                  disabled={!destinationState}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={destinationState ? "Select city" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getCitiesByState(destinationCountry, destinationState).map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    id="destinationCity"
                    type="text"
                    placeholder="Enter your city name"
                    {...register('destinationCity')}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowDestinationCityInput(false);
                      setDestinationCitySelect('');
                      setValue('destinationCity', '');
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    ← Back to list
                  </button>
                </div>
              )}
              {errors.destinationCity && (
                <p className="text-sm text-destructive">{errors.destinationCity.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Provide information about your trip</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Departure Date *</Label>
              <Input
                id="departureDate"
                type="datetime-local"
                {...register('departureDate')}
              />
              {errors.departureDate && (
                <p className="text-sm text-destructive">{errors.departureDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrivalDate">Arrival Date (Optional)</Label>
              <Input
                id="arrivalDate"
                type="datetime-local"
                {...register('arrivalDate')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availableCapacity">Available Capacity (kg) *</Label>
              <Input
                id="availableCapacity"
                type="number"
                step="0.1"
                {...register('availableCapacity', { valueAsNumber: true })}
              />
              {errors.availableCapacity && (
                <p className="text-sm text-destructive">{errors.availableCapacity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerKg">Price per kg (₹) *</Label>
              <Input
                id="pricePerKg"
                type="number"
                step="0.01"
                {...register('pricePerKg', { valueAsNumber: true })}
              />
              {errors.pricePerKg && (
                <p className="text-sm text-destructive">{errors.pricePerKg.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any additional information about your trip..."
              {...register('description')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : tripId ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
}
