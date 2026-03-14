'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Phone, Mail, Calendar, FileText, Shield, Star, Award } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trustScoreData, setTrustScoreData] = useState<any>(null);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    languages: [] as string[],
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : 'U';

  useEffect(() => {
    fetchProfile();
    fetchTrustScore();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const data = response.data;
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        bio: data.bio || '',
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        postalCode: data.postalCode || '',
        languages: data.languages || [],
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        emergencyContactRelation: data.emergencyContactRelation || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchTrustScore = async () => {
    try {
      const response = await api.get('/users/trust-score/level');
      setTrustScoreData(response.data);
    } catch (error) {
      console.error('Failed to fetch trust score:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Filter out empty strings and only send fields with actual values
      const updateData: any = {};

      Object.entries(profile).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // For arrays, only include if not empty
          if (Array.isArray(value)) {
            if (value.length > 0) {
              updateData[key] = value;
            }
          } else {
            updateData[key] = value;
          }
        }
      });

      await api.put('/users/profile', updateData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground mt-2">
          View and manage your profile information
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profilePicture} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {user?.firstName} {user?.lastName}
                    </CardTitle>
                    <CardDescription className="mt-1">{user?.email}</CardDescription>
                    <div className="flex gap-2 mt-2">
                      {user?.isVerified && (
                        <Badge variant="default" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      {trustScoreData && (
                        <Badge variant="secondary" className="gap-1">
                          <Award className="h-3 w-3" />
                          {trustScoreData.level} ({trustScoreData.trustScore})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-2">
                <Label>Languages (comma separated)</Label>
                <Input
                  value={profile.languages.join(', ')}
                  onChange={(e) => setProfile({
                    ...profile,
                    languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                  })}
                  disabled={!isEditing}
                  placeholder="English, Spanish, French"
                />
              </div>

              {isEditing && (
                <Button onClick={handleSave} disabled={isLoading}>
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Your residential address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <Button onClick={handleSave} disabled={isLoading}>
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  value={profile.emergencyContactRelation}
                  onChange={(e) => setProfile({ ...profile, emergencyContactRelation: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., Mother, Brother, Friend"
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} disabled={isLoading}>
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Documents</CardTitle>
              <CardDescription>Upload documents to increase your trust score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ID Document</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*,application/pdf" />
                  <Button variant="secondary">Upload</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload government-issued ID (+10 trust points)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Driver's License</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*,application/pdf" />
                  <Button variant="secondary">Upload</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload driver's license (optional)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Proof of Address</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*,application/pdf" />
                  <Button variant="secondary">Upload</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Utility bill or bank statement (optional)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
