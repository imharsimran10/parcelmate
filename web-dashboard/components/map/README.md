# Map Components

This directory contains map components for location selection.

## Components

### LocationPickerLeaflet.tsx (Active - No API Key Required)
Uses **Leaflet + OpenStreetMap** for map rendering and **Nominatim** for geocoding.

**Benefits:**
- No API key required - completely free
- Open-source
- Works out of the box
- Perfect for demos and development

**Features:**
- Click on map to select location
- Search for locations by address
- Drag markers to adjust location
- Reverse geocoding to get address from coordinates

### LocationPicker.tsx (Legacy - Requires Mapbox API Key)
Original component using Mapbox GL JS.

**Note:** This component has been replaced by LocationPickerLeaflet due to Mapbox requiring an API key and having loading issues. Kept for reference.

## Usage

```tsx
import LocationPicker from '@/components/map/LocationPickerLeaflet';

<LocationPicker
  label="Select Location"
  initialLocation={location}
  onLocationSelect={(location) => {
    console.log(location);
  }}
/>
```

## Geocoding API

We use **Nominatim** (OpenStreetMap's geocoding service):
- Forward geocoding: Address → Coordinates
- Reverse geocoding: Coordinates → Address
- No API key required
- Rate limit: 1 request per second (suitable for demos)

For production, consider:
- Setting up your own Nominatim instance
- Using a commercial geocoding service
- Implementing request throttling
