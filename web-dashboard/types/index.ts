// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture?: string;
  trustScore: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  preferredLanguages: string[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

// Trip Types
export interface Trip {
  id: string;
  travelerId: string;
  traveler?: User;
  origin: Location;
  destination: Location;
  departureDate: string;
  arrivalDate?: string;
  availableCapacity: number;
  pricePerKg: number;
  status: 'pending' | 'matched' | 'in_transit' | 'delivered' | 'cancelled';
  restrictions?: string[];
  description?: string;
  matchedParcels?: Parcel[];
  createdAt: string;
  updatedAt: string;
}

// Parcel Types
export interface Parcel {
  id: string;
  senderId: string;
  sender?: User;
  pickupLocation: Location;
  deliveryLocation: Location;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  category: string;
  description: string;
  images?: string[];
  declaredValue: number;
  offeredPrice: number;
  status: 'pending' | 'matched' | 'in_transit' | 'delivered' | 'cancelled';
  matchedTrip?: Trip;
  matchedTripId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Matching Types
export interface Match {
  parcelId: string;
  tripId: string;
  parcel: Parcel;
  trip: Trip;
  matchScore: number;
  distance: number;
  estimatedCost: number;
  reasons: string[];
}

// Message Types
export interface Message {
  id: string;
  parcelId: string;
  senderId: string;
  receiverId: string;
  sender?: User;
  receiver?: User;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  parcelId: string;
  parcel: Parcel;
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

// Payment Types
export interface Payment {
  id: string;
  parcelId: string;
  senderId: string;
  travelerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded' | 'failed';
  stripePaymentIntentId: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
}

// Review Types
export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  reviewer?: User;
  reviewee?: User;
  parcelId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'MATCH_REQUEST' | 'MATCH_APPROVED' | 'MATCH_REJECTED' | 'match_found' | 'message' | 'payment' | 'delivery' | 'review';
  title: string;
  message: string;
  data?: any; // Additional data like matchRequestId
  isRead: boolean;
  relatedId?: string; // parcelId, tripId, messageId, etc.
  createdAt: string;
}

// Statistics Types
export interface Statistics {
  totalTrips: number;
  totalParcels: number;
  totalEarnings: number;
  totalSpent: number;
  completedDeliveries: number;
  averageRating: number;
  trustScore: number;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Tracking Types
export interface LocationUpdate {
  parcelId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types
export interface TripFilters {
  status?: Trip['status'];
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ParcelFilters {
  status?: Parcel['status'];
  category?: string;
  minWeight?: number;
  maxWeight?: number;
  page?: number;
  limit?: number;
}

// Form Types
export interface TripFormData {
  origin: Location;
  destination: Location;
  departureDate: string;
  arrivalDate?: string;
  availableCapacity: number;
  pricePerKg: number;
  restrictions?: string[];
  description?: string;
}

export interface ParcelFormData {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  pickupNotes?: string;
  deliveryNotes?: string;
  title?: string;
  description: string;
  size?: 'DOCUMENT' | 'SMALL' | 'MEDIUM';
  weight: number;
  declaredValue: number;
  pickupTimeStart?: string;
  pickupTimeEnd?: string;
  deliveryTimeStart?: string;
  deliveryTimeEnd?: string;
  urgency?: 'FLEXIBLE' | 'STANDARD' | 'URGENT';
  offeredPrice: number;
}

// Store Types
export type UserRole = 'traveler' | 'sender';
