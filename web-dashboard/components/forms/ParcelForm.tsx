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
import { ParcelFormData } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import { countries, getStatesByCountry, getCitiesByState } from '@/lib/location-data';

const parcelSchema = z.object({
  // Recipient info
  recipientName: z.string().min(1, 'Recipient name is required'),
  recipientPhone: z.string().min(1, 'Recipient phone is required'),
  recipientEmail: z.string().email().optional().or(z.literal('')),

  // Pickup address
  pickupStreet: z.string().optional(),
  pickupCity: z.string().min(1, 'Pickup city is required'),
  pickupState: z.string().min(1, 'Pickup state is required'),
  pickupCountry: z.string().min(1, 'Pickup country is required'),
  pickupNotes: z.string().optional(),

  // Delivery address
  deliveryStreet: z.string().optional(),
  deliveryCity: z.string().min(1, 'Delivery city is required'),
  deliveryState: z.string().min(1, 'Delivery state is required'),
  deliveryCountry: z.string().min(1, 'Delivery country is required'),
  deliveryNotes: z.string().optional(),

  // Parcel details
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  size: z.enum(['DOCUMENT', 'SMALL', 'MEDIUM'], {
    errorMap: () => ({ message: 'Please select a parcel size' }),
  }),
  weight: z.number().min(0.1, 'Weight must be at least 0.1 kg').max(100),
  declaredValue: z.number().min(0, 'Declared value must be positive'),

  // Timing
  pickupTimeStart: z.string().min(1, 'Pickup start time is required'),
  pickupTimeEnd: z.string().min(1, 'Pickup end time is required'),
  deliveryTimeStart: z.string().optional(),
  deliveryTimeEnd: z.string().optional(),
  urgency: z.enum(['FLEXIBLE', 'STANDARD', 'URGENT']).optional(),

  // Pricing
  offeredPrice: z.number().min(5, 'Price must be at least ₹5'),
});

type ParcelFormValues = z.infer<typeof parcelSchema>;

interface ParcelFormProps {
  initialData?: Partial<ParcelFormData>;
  parcelId?: string;
}

export default function ParcelForm({ initialData, parcelId }: ParcelFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location selection state
  const [pickupCountry, setPickupCountry] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('');
  const [deliveryState, setDeliveryState] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
    defaultValues: {
      recipientName: initialData?.recipientName || '',
      recipientPhone: initialData?.recipientPhone || '',
      recipientEmail: initialData?.recipientEmail || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      size: initialData?.size || undefined,
      weight: initialData?.weight || 1,
      declaredValue: initialData?.declaredValue || 0,
      offeredPrice: initialData?.offeredPrice || 10,
      pickupStreet: '',
      pickupCity: '',
      pickupState: '',
      pickupCountry: '',
      deliveryStreet: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryCountry: '',
      pickupNotes: initialData?.pickupNotes || '',
      deliveryNotes: initialData?.deliveryNotes || '',
      pickupTimeStart: initialData?.pickupTimeStart || '',
      pickupTimeEnd: initialData?.pickupTimeEnd || '',
      deliveryTimeStart: initialData?.deliveryTimeStart || '',
      deliveryTimeEnd: initialData?.deliveryTimeEnd || '',
      urgency: initialData?.urgency || 'STANDARD',
    },
  });

  const onSubmit = async (data: ParcelFormValues) => {
    setIsSubmitting(true);

    try {
      // Build full addresses from components
      const pickupAddress = [
        data.pickupStreet,
        data.pickupCity,
        data.pickupState,
        data.pickupCountry,
      ]
        .filter(Boolean)
        .join(', ');

      const deliveryAddress = [
        data.deliveryStreet,
        data.deliveryCity,
        data.deliveryState,
        data.deliveryCountry,
      ]
        .filter(Boolean)
        .join(', ');

      // Use default coordinates (0, 0) - can be updated later if needed
      // In production, you would geocode these or have users select on a map
      const payload = {
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        recipientEmail: data.recipientEmail || undefined,
        pickupAddress: pickupAddress,
        pickupLat: 0,
        pickupLng: 0,
        pickupNotes: data.pickupNotes || undefined,
        deliveryAddress: deliveryAddress,
        deliveryLat: 0,
        deliveryLng: 0,
        deliveryNotes: data.deliveryNotes || undefined,
        title: data.title,
        description: data.description,
        size: data.size,
        weight: data.weight,
        declaredValue: data.declaredValue,
        pickupTimeStart: data.pickupTimeStart,
        pickupTimeEnd: data.pickupTimeEnd,
        deliveryTimeStart: data.deliveryTimeStart || undefined,
        deliveryTimeEnd: data.deliveryTimeEnd || undefined,
        urgency: data.urgency || 'STANDARD',
        offeredPrice: data.offeredPrice,
      };

      let response;

      if (parcelId) {
        // Update existing parcel
        response = await api.put(`/parcels/${parcelId}`, payload);
        console.log('Update response:', response);
      } else {
        // Create new parcel
        response = await api.post('/parcels', payload);
        console.log('Create response:', response);
      }

      // Only show success toast and navigate if we reach here (no error thrown)
      setIsSubmitting(false);

      if (parcelId) {
        toast.success('Parcel updated successfully!');
        router.push('/parcels');
      } else {
        toast.success('Parcel created successfully!');

        // Navigate to parcels list or details page
        setTimeout(() => {
          if (response.data?.data?.id) {
            router.push(`/parcels/${response.data.data.id}`);
          } else if (response.data?.id) {
            router.push(`/parcels/${response.data.id}`);
          } else {
            router.push('/parcels');
          }
        }, 500);
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error('Error saving parcel:', err);
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const message = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || 'Failed to save parcel';
      toast.error(message);
    }
  };

  const parcelSizes = [
    { value: 'DOCUMENT', label: 'Document (≤ 500g)', description: 'Envelopes, papers, small documents' },
    { value: 'SMALL', label: 'Small (≤ 2kg)', description: 'Small packages, books, electronics' },
    { value: 'MEDIUM', label: 'Medium (2-5kg)', description: 'Larger boxes, multiple items' },
  ];

  const urgencyOptions = [
    { value: 'FLEXIBLE', label: 'Flexible', description: 'No rush, delivery within a week' },
    { value: 'STANDARD', label: 'Standard', description: 'Delivery within 2-3 days' },
    { value: 'URGENT', label: 'Urgent', description: 'Same day or next day delivery' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recipient Information</CardTitle>
          <CardDescription>Who will receive the parcel?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name *</Label>
              <Input
                id="recipientName"
                type="text"
                placeholder="John Smith"
                {...register('recipientName')}
              />
              {errors.recipientName && (
                <p className="text-sm text-destructive">{errors.recipientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientPhone">Recipient Phone *</Label>
              <Input
                id="recipientPhone"
                type="tel"
                placeholder="+1234567890"
                {...register('recipientPhone')}
              />
              {errors.recipientPhone && (
                <p className="text-sm text-destructive">{errors.recipientPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email (Optional)</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              {...register('recipientEmail')}
            />
            {errors.recipientEmail && (
              <p className="text-sm text-destructive">{errors.recipientEmail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pickup Location</CardTitle>
          <CardDescription>Where should the parcel be picked up?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickupStreet">Street Address, Building, Apartment (Optional)</Label>
            <Input
              id="pickupStreet"
              type="text"
              placeholder="123 Main Street, Apartment 4B"
              {...register('pickupStreet')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupCountry">Country *</Label>
              <Select
                value={pickupCountry}
                onValueChange={(value) => {
                  setPickupCountry(value);
                  setPickupState('');
                  setValue('pickupCountry', value);
                  setValue('pickupState', '');
                  setValue('pickupCity', '');
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
              {errors.pickupCountry && (
                <p className="text-sm text-destructive">{errors.pickupCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupState">State/Province *</Label>
              <Select
                value={pickupState}
                onValueChange={(value) => {
                  setPickupState(value);
                  setValue('pickupState', value);
                  setValue('pickupCity', '');
                }}
                disabled={!pickupCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={pickupCountry ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(pickupCountry).map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pickupState && (
                <p className="text-sm text-destructive">{errors.pickupState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupCity">City *</Label>
              <Select
                onValueChange={(value) => setValue('pickupCity', value)}
                disabled={!pickupState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={pickupState ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesByState(pickupCountry, pickupState).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pickupCity && (
                <p className="text-sm text-destructive">{errors.pickupCity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupNotes">Pickup Notes (Optional)</Label>
            <textarea
              id="pickupNotes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Special instructions, landmarks, contact person..."
              {...register('pickupNotes')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickupTimeStart">Pickup Window Start *</Label>
              <Input
                id="pickupTimeStart"
                type="datetime-local"
                {...register('pickupTimeStart')}
              />
              {errors.pickupTimeStart && (
                <p className="text-sm text-destructive">{errors.pickupTimeStart.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupTimeEnd">Pickup Window End *</Label>
              <Input
                id="pickupTimeEnd"
                type="datetime-local"
                {...register('pickupTimeEnd')}
              />
              {errors.pickupTimeEnd && (
                <p className="text-sm text-destructive">{errors.pickupTimeEnd.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Location</CardTitle>
          <CardDescription>Where should the parcel be delivered?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryStreet">Street Address, Building, Apartment (Optional)</Label>
            <Input
              id="deliveryStreet"
              type="text"
              placeholder="456 Park Avenue, Suite 12"
              {...register('deliveryStreet')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryCountry">Country *</Label>
              <Select
                value={deliveryCountry}
                onValueChange={(value) => {
                  setDeliveryCountry(value);
                  setDeliveryState('');
                  setValue('deliveryCountry', value);
                  setValue('deliveryState', '');
                  setValue('deliveryCity', '');
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
              {errors.deliveryCountry && (
                <p className="text-sm text-destructive">{errors.deliveryCountry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryState">State/Province *</Label>
              <Select
                value={deliveryState}
                onValueChange={(value) => {
                  setDeliveryState(value);
                  setValue('deliveryState', value);
                  setValue('deliveryCity', '');
                }}
                disabled={!deliveryCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={deliveryCountry ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {getStatesByCountry(deliveryCountry).map((state) => (
                    <SelectItem key={state.name} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deliveryState && (
                <p className="text-sm text-destructive">{errors.deliveryState.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryCity">City *</Label>
              <Select
                onValueChange={(value) => setValue('deliveryCity', value)}
                disabled={!deliveryState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={deliveryState ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesByState(deliveryCountry, deliveryState).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deliveryCity && (
                <p className="text-sm text-destructive">{errors.deliveryCity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
            <textarea
              id="deliveryNotes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Special instructions, landmarks, contact person..."
              {...register('deliveryNotes')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryTimeStart">Delivery Window Start (Optional)</Label>
              <Input
                id="deliveryTimeStart"
                type="datetime-local"
                {...register('deliveryTimeStart')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryTimeEnd">Delivery Window End (Optional)</Label>
              <Input
                id="deliveryTimeEnd"
                type="datetime-local"
                {...register('deliveryTimeEnd')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parcel Details</CardTitle>
          <CardDescription>Provide information about your parcel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Parcel Title *</Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g., Important Documents, Gift Package, Books"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Describe what you're sending..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Parcel Size *</Label>
            <select
              id="size"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('size')}
            >
              <option value="">Select parcel size</option>
              {parcelSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label} - {size.description}
                </option>
              ))}
            </select>
            {errors.size && (
              <p className="text-sm text-destructive">{errors.size.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0.5"
                {...register('weight', { valueAsNumber: true })}
              />
              {errors.weight && (
                <p className="text-sm text-destructive">{errors.weight.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="declaredValue">Declared Value (₹) *</Label>
              <Input
                id="declaredValue"
                type="number"
                step="0.01"
                placeholder="1000"
                {...register('declaredValue', { valueAsNumber: true })}
              />
              {errors.declaredValue && (
                <p className="text-sm text-destructive">{errors.declaredValue.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency</Label>
            <select
              id="urgency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register('urgency')}
            >
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offeredPrice">Offered Price (₹) *</Label>
            <Input
              id="offeredPrice"
              type="number"
              step="0.01"
              placeholder="50"
              {...register('offeredPrice', { valueAsNumber: true })}
            />
            {errors.offeredPrice && (
              <p className="text-sm text-destructive">{errors.offeredPrice.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum price: ₹5. This is what you'll pay the traveler.
            </p>
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
          {isSubmitting ? 'Saving...' : parcelId ? 'Update Parcel' : 'Create Parcel'}
        </Button>
      </div>
    </form>
  );
}
