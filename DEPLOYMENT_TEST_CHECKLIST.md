# Deployment Test Checklist

## Pre-Testing Steps
1. Wait 2-3 minutes for Vercel to redeploy both backend and frontend
2. Clear browser cache or use incognito mode
3. Open browser console to monitor for errors

## Backend Health Check
- [ ] Visit: https://paarcelmate-backend.vercel.app/api/v1/health
- [ ] Expected: `{"status":"ok","timestamp":"...","environment":"production"}`

## 1. Authentication Flow

### Registration
- [ ] Navigate to registration page
- [ ] Fill in user details:
  - First Name: Test
  - Last Name: User
  - Email: testuser@example.com (use unique email each time)
  - Phone: +1234567890 (optional)
  - Password: Test@123456
- [ ] Submit form
- [ ] Check email for OTP (6-digit code)
- [ ] Enter OTP in verification screen
- [ ] Expected: Redirect to dashboard

### Login
- [ ] Logout from dashboard
- [ ] Navigate to login page
- [ ] Enter credentials:
  - Email: (your registered email)
  - Password: (your password)
- [ ] Click login
- [ ] Expected: Redirect to dashboard with no errors

## 2. Dashboard/Overview
- [ ] Dashboard loads without errors
- [ ] Statistics cards display:
  - Total Trips: 0
  - Completed Deliveries: 0
  - Total Earnings: ₹0.00
  - Average Rating: N/A
- [ ] No 500 errors in console
- [ ] No WebSocket errors (disabled for Vercel)

## 3. Create Trip

### Navigate to Create Trip
- [ ] Click "Trips" in sidebar
- [ ] Click "Create New Trip" or similar button

### Fill Trip Form
- [ ] Origin:
  - Country: India
  - State: Maharashtra
  - City: Mumbai
- [ ] Destination:
  - Country: India
  - State: Delhi
  - City: New Delhi
- [ ] Trip Details:
  - Departure Date: (any future date/time)
  - Available Capacity: 10 kg
  - Price per kg: ₹50
  - Description: "Test trip Mumbai to Delhi"
- [ ] Click "Create Trip"
- [ ] Expected: Success message and redirect to trip details or trips list
- [ ] Verify trip appears in trips list

## 4. View Trips
- [ ] Navigate to "Trips" page
- [ ] Expected: See the trip just created
- [ ] Click on trip to view details
- [ ] Expected: All trip information displayed correctly

## 5. Create Parcel

### Navigate to Create Parcel
- [ ] Click "Parcels" in sidebar
- [ ] Click "Create New Parcel" or similar button

### Fill Parcel Form
- [ ] Recipient Details:
  - Name: John Doe
  - Phone: +9876543210
  - Email: john@example.com (optional)
- [ ] Pickup Address:
  - (Similar to trip creation - select country, state, city)
- [ ] Delivery Address:
  - (Select different location)
- [ ] Parcel Details:
  - Title: "Test Package"
  - Description: "Testing parcel creation"
  - Size: Select from dropdown (DOCUMENT/SMALL/MEDIUM)
  - Weight: 2 kg
  - Declared Value: ₹1000
  - Offered Price: ₹100
- [ ] Timing:
  - Pickup Time Start: (future date/time)
  - Pickup Time End: (later same day)
- [ ] Click "Create Parcel"
- [ ] Expected: Success message and redirect
- [ ] Verify parcel appears in parcels list

## 6. View Parcels
- [ ] Navigate to "Parcels" page
- [ ] Expected: See the parcel just created
- [ ] Click on parcel to view details
- [ ] Expected: All parcel information displayed correctly

## 7. Profile/Settings
- [ ] Navigate to profile settings
- [ ] View user information
- [ ] Try updating profile (optional)
- [ ] Expected: No errors

## Known Limitations (Expected)
✓ WebSocket features disabled (no real-time tracking)
✓ Coordinates default to 0,0 (no geocoding yet)
✓ No actual payment processing (Stripe not configured)
✓ No SMS notifications (Twilio not configured)
✓ File uploads not configured (S3 not set up)

## Common Issues & Fixes

### Issue: 404 Errors
- **Cause**: Old build cache
- **Fix**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### Issue: 401 Unauthorized
- **Cause**: Token expired
- **Fix**: Logout and login again

### Issue: Validation Errors
- **Cause**: Missing required fields
- **Fix**: Check all required fields are filled

### Issue: Network Errors
- **Cause**: Vercel deployment still in progress
- **Fix**: Wait 2-3 minutes and try again

## Success Criteria
- [ ] All authentication flows work
- [ ] Dashboard loads with statistics
- [ ] Can create trips successfully
- [ ] Can create parcels successfully
- [ ] Can view trips and parcels
- [ ] No unexpected 500 errors
- [ ] Console shows no critical errors

## Test Results

### Date: _______
### Tester: _______

| Feature | Status | Notes |
|---------|--------|-------|
| Registration | ⬜ Pass / ⬜ Fail | |
| Login | ⬜ Pass / ⬜ Fail | |
| Dashboard | ⬜ Pass / ⬜ Fail | |
| Create Trip | ⬜ Pass / ⬜ Fail | |
| View Trips | ⬜ Pass / ⬜ Fail | |
| Create Parcel | ⬜ Pass / ⬜ Fail | |
| View Parcels | ⬜ Pass / ⬜ Fail | |

### Additional Notes:
```
[Add any additional observations or issues encountered]
```

## Deployment URLs
- Frontend: (Your Vercel frontend URL)
- Backend: https://paarcelmate-backend.vercel.app
- API Base: https://paarcelmate-backend.vercel.app/api/v1
