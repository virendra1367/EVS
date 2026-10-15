import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Station, StationType } from '../types';
import {
  calculateDistance,
  fetchDrivingRoute,
  getDirectionsUrl,
  formatOpenDays,
  Coordinates,
  RouteInfo,
} from '../utils/geo';
import { Navigation, Compass, MapPin, Clock, Calendar, Check, X, Car } from 'lucide-react';

interface StationMapProps {
  stations: Station[];
  userCoords: Coordinates;
  userAddress?: string;
  selectedStationId?: string;
  onSelectStation: (station: Station) => void;
  onBookStation: (station: Station) => void;
  onRequestLocation?: () => void;
}

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  userCoords,
  userAddress,
  selectedStationId,
  onSelectStation,
  onBookStation,
  onRequestLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [activeRoute, setActiveRoute] = useState<{
    station: Station;
    route: RouteInfo;
  } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.latitude, userCoords.longitude],
        zoom: 13,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update User Marker when userCoords change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userIcon = L.divIcon({
      className: 'user-pin-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></span>
          <span class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-xs text-white font-black">
            📍
          </span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -18],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoords.latitude, userCoords.longitude]);
    } else {
      userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    userMarkerRef.current.bindPopup(`
      <div class="p-2.5 text-xs font-sans text-slate-900 space-y-1">
        <div class="font-extrabold text-blue-700 flex items-center gap-1">
          <span>●</span> Your Current Location (Origin)
        </div>
        <div class="text-[11px] text-slate-600 leading-tight">
          ${userAddress || `${userCoords.latitude.toFixed(4)}° N, ${userCoords.longitude.toFixed(4)}° E`}
        </div>
        <div class="text-[10px] text-slate-400 font-mono">
          Lat: ${userCoords.latitude.toFixed(4)}, Lng: ${userCoords.longitude.toFixed(4)}
        </div>
      </div>
    `);
  }, [userCoords, userAddress]);

  // Update Station Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old station markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    stations.forEach((station) => {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        station.latitude,
        station.longitude
      );

      const isSelected = station.id === selectedStationId;
      const markerHtml = createMarkerHtml(station.type, isSelected);

      const customIcon = L.divIcon({
        className: 'station-pin-marker',
        html: markerHtml,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: customIcon }).addTo(map);

      const availableBays = station.bays.filter((b) => b.status === 'AVAILABLE').length;
      const typeLabel =
        station.type === 'HYBRID'
          ? 'EV + CNG Hybrid'
          : station.type === 'EV'
          ? 'EV Fast Charging'
          : 'CNG Gas Refuelling';
      const badgeBg =
        station.type === 'EV'
          ? 'bg-emerald-50 text-emerald-800'
          : station.type === 'CNG'
          ? 'bg-sky-50 text-sky-800'
          : 'bg-teal-50 text-teal-800';

      const daysText = formatOpenDays(station.openDays);

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 w-64 space-y-2 text-xs font-sans text-slate-800';

      popupDiv.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${badgeBg}">${typeLabel}</span>
          <span class="font-bold text-slate-700 tabular-nums">${distance} km away</span>
        </div>
        <div class="font-bold text-sm text-slate-900 leading-tight">${station.name}</div>
        <div class="text-[11px] text-slate-500 line-clamp-1">${station.address}</div>
        
        <div class="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-md flex items-center gap-1.5">
          <span class="text-emerald-700 font-bold">🗓 ${daysText}</span>
        </div>

        <div class="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span class="text-emerald-700 font-semibold">${availableBays} bays free now</span>
          <span class="text-slate-500 font-medium">★ ${station.rating} (${station.reviewsCount})</span>
        </div>
        <div class="pt-2 flex items-center gap-1.5">
          <button id="book-btn-${station.id}" class="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-center transition-colors">
            Reserve Slot
          </button>
          <button id="route-btn-${station.id}" class="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-md text-center transition-colors">
            Show Route
          </button>
        </div>
      `;

      const bookBtn = popupDiv.querySelector(`#book-btn-${station.id}`);
      if (bookBtn) {
        bookBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          onBookStation(station);
        });
      }

      const routeBtn = popupDiv.querySelector(`#route-btn-${station.id}`);
      if (routeBtn) {
        routeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handlePlotRoute(station);
        });
      }

      marker.bindPopup(popupDiv);

      marker.on('click', () => {
        onSelectStation(station);
        handlePlotRoute(station);
      });

      markersRef.current[station.id] = marker;
    });
  }, [stations, userCoords, selectedStationId]);

  // Handle selected station changed from outside
  useEffect(() => {
    if (!selectedStationId) return;
    const targetStation = stations.find((s) => s.id === selectedStationId);
    if (targetStation) {
      handlePlotRoute(targetStation);
    }
  }, [selectedStationId]);

  // Fetch real driving route and draw path on the map
  const handlePlotRoute = async (station: Station) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setLoadingRoute(true);
    const route = await fetchDrivingRoute(
      userCoords.latitude,
      userCoords.longitude,
      station.latitude,
      station.longitude
    );
    setLoadingRoute(false);

    setActiveRoute({ station, route });

    // Remove existing polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    // Draw real route geometry
    const polyline = L.polyline(route.geometry, {
      color: '#059669', // Emerald road line
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    routePolylineRef.current = polyline;

    // Fit map bounds to show both origin and destination with padding
    map.fitBounds(polyline.getBounds(), {
      padding: [50, 50],
      maxZoom: 15,
      animate: true,
    });
  };

  const handleClearRoute = () => {
    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    setActiveRoute(null);
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([userCoords.latitude, userCoords.longitude], 13);
    }
  };

  const handleCenterOnUser = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView([userCoords.latitude, userCoords.longitude], 14, { animate: true });
      if (userMarkerRef.current) {
        userMarkerRef.current.openPopup();
      }
    }
    if (onRequestLocation) {
      onRequestLocation();
    }
  };

  return (
    <div className="relative w-full h-[450px] lg:h-[580px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Center on My Location Button */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterOnUser}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 font-semibold text-xs rounded-xl shadow-md border border-slate-200 transition-all hover:scale-105"
          title="Center on your current GPS location"
        >
          <Compass className="w-4 h-4 text-blue-600" />
          <span>My GPS Location</span>
        </button>
      </div>

      {/* Real Route Info Floating Banner */}
      {activeRoute && (
        <div className="absolute bottom-4 inset-x-4 z-20 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Real Road Driving Route
              </span>
            </div>
            <div className="font-bold text-sm text-white truncate max-w-xs">
              {activeRoute.station.name}
            </div>
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span className="font-bold text-emerald-400 tabular-nums">
                {activeRoute.route.distanceKm} km
              </span>
              <span>·</span>
              <span className="text-white font-medium tabular-nums">
                ~{activeRoute.route.durationMins} mins drive
              </span>
              <span>·</span>
              <span className="text-[11px] text-slate-400">
                {formatOpenDays(activeRoute.station.openDays)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={getDirectionsUrl(
                activeRoute.station.latitude,
                activeRoute.station.longitude,
                activeRoute.station.name,
                userCoords.latitude,
                userCoords.longitude
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Turn-by-Turn GPS</span>
            </a>

            <button
              onClick={handleClearRoute}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Clear Route"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs space-y-1.5 pointer-events-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Legend</div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-xs"></span>
          <span>Your Origin Location</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs"></span>
          <span>EV Charging Hub</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-sky-600 inline-block shadow-xs"></span>
          <span>CNG Gas Dispenser</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-teal-600 inline-block shadow-xs"></span>
          <span>Hybrid Multi-Fuel</span>
        </div>
      </div>
    </div>
  );
};

function createMarkerHtml(type: StationType, isSelected: boolean): string {
  const isEv = type === 'EV';
  const isCng = type === 'CNG';
  const isHybrid = type === 'HYBRID';

  const bgColor = isEv ? 'bg-emerald-600' : isCng ? 'bg-sky-600' : 'bg-teal-600';
  const ringClass = isSelected ? 'ring-4 ring-amber-400 scale-110 shadow-xl' : 'hover:scale-105 shadow-md';
  const iconGlyph = isEv ? '⚡' : isCng ? '⛽' : '🔋';

  return `
    <div class="relative flex flex-col items-center group transition-transform ${ringClass}">
      <div class="w-10 h-10 rounded-full ${bgColor} text-white flex items-center justify-center font-bold text-sm border-2 border-white">
        <span>${iconGlyph}</span>
      </div>
      <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1 shadow-sm"></div>
    </div>
  `;
}
