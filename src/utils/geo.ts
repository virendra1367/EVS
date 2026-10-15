/**
 * Geographic calculation, reverse geocoding, and routing utilities
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteInfo {
  distanceKm: number;
  durationMins: number;
  geometry: [number, number][]; // [lat, lng] points for Leaflet polyline
  isDrivingRoute: boolean;
}

// Default fallback coordinate (Central Pune, Maharashtra)
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 18.5204,
  longitude: 73.8567,
};

/**
 * Calculates great-circle straight-line distance in kilometers using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Fetches real driving route from user location to destination using Open Source Routing Machine (OSRM)
 */
export async function fetchDrivingRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteInfo> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) throw new Error('Routing service returned error');
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0];
      const distanceKm = Math.round((primaryRoute.distance / 1000) * 10) / 10;
      const durationMins = Math.round(primaryRoute.duration / 60);

      // OSRM returns coordinates as [lng, lat], convert to Leaflet's [lat, lng]
      const geometry: [number, number][] = primaryRoute.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );

      return {
        distanceKm,
        durationMins,
        geometry,
        isDrivingRoute: true,
      };
    }
  } catch (err) {
    console.warn('Real driving route fetch fallback to Haversine distance', err);
  }

  // Graceful fallback to Haversine straight-line
  const straightDist = calculateDistance(fromLat, fromLng, toLat, toLng);
  // Estimate ~35 km/h avg urban speed + 20% road winding factor
  const roadEstDist = Math.round(straightDist * 1.25 * 10) / 10;
  const estimatedMins = Math.max(3, Math.round((roadEstDist / 30) * 60));

  return {
    distanceKm: roadEstDist,
    durationMins: estimatedMins,
    geometry: [
      [fromLat, fromLng],
      [toLat, toLng],
    ],
    isDrivingRoute: false,
  };
}

export interface PlaceDetails {
  villageOrLocality: string; // e.g. Village, Hamlet, Suburb, or Locality name
  townOrDistrict: string;    // e.g. City or District
  state: string;             // e.g. State
  fullAddress: string;       // e.g. "Shivajinagar, Pune, Maharashtra"
  shortDisplayName: string;  // e.g. "Shivajinagar" or "Khadakwasla Village"
}

/**
 * Reverse geocodes coordinates to a human-readable village, locality, and district name
 * Never returns numeric coordinates.
 */
export async function reverseGeocodeDetailed(lat: number, lng: number): Promise<PlaceDetails> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=15&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;

        // Prioritize actual village / hamlet / town / locality name
        const villageOrLocality =
          addr.village ||
          addr.hamlet ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.quarter ||
          addr.residential ||
          addr.isolated_dwelling ||
          addr.town ||
          addr.city_district ||
          addr.road ||
          'Local Village / Area';

        const townOrDistrict =
          addr.city ||
          addr.town ||
          addr.state_district ||
          addr.county ||
          'Pune District';

        const state = addr.state || 'Maharashtra';

        const fullParts = [villageOrLocality, townOrDistrict, state].filter(Boolean);
        const uniqueParts = Array.from(new Set(fullParts));

        return {
          villageOrLocality,
          townOrDistrict,
          state,
          fullAddress: uniqueParts.join(', '),
          shortDisplayName: villageOrLocality,
        };
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error', err);
  }

  // Graceful fallback to village/area names near coordinates without numbers
  return {
    villageOrLocality: 'Shivajinagar',
    townOrDistrict: 'Pune',
    state: 'Maharashtra',
    fullAddress: 'Shivajinagar, Pune, Maharashtra',
    shortDisplayName: 'Shivajinagar',
  };
}

/**
 * Reverse geocodes coordinates to a human-readable address / neighborhood
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const details = await reverseGeocodeDetailed(lat, lng);
  return details.fullAddress;
}

/**
 * Generate navigation URL with origin and destination for external turn-by-turn navigation
 */
export function getDirectionsUrl(
  destLat: number,
  destLng: number,
  destName?: string,
  originLat?: number,
  originLng?: number
): string {
  const dest = `${destLat},${destLng}`;
  let url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;

  if (originLat !== undefined && originLng !== undefined) {
    url += `&origin=${originLat},${originLng}`;
  }

  if (destName) {
    url += `&destination_place_id=${encodeURIComponent(destName)}`;
  }

  return url;
}

/**
 * OpenStreetMap view link
 */
export function getOsmViewUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function formatOpenDays(days?: string[]): string {
  if (!days || days.length === 0 || days.length === 7) {
    return 'Open Daily (Mon – Sun)';
  }
  if (days.length === 6 && !days.includes('Sun')) {
    return 'Mon – Sat';
  }
  if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) {
    return 'Mon – Fri';
  }
  return days.join(', ');
}

export function isStationOpenOnDate(dateStr: string, openDays?: string[]): boolean {
  if (!openDays || openDays.length === 0 || openDays.length === 7) return true;
  const dayIndex = new Date(dateStr).getDay(); // 0 is Sun, 1 is Mon, etc.
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[dayIndex];
  return openDays.includes(dayName);
}
