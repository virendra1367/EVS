import React, { useState, useMemo } from 'react';
import { Station, StationType } from '../types';
import { StationCard } from './StationCard';
import { StationMap } from './StationMap';
import { calculateDistance, Coordinates } from '../utils/geo';
import { Search, Map, List, RotateCcw, Filter, Zap, Fuel, Layers, Compass, MapPin } from 'lucide-react';

interface StationFinderProps {
  stations: Station[];
  userCoords: Coordinates;
  userAddress?: string;
  userVillage?: string;
  favourites: string[];
  onToggleFavourite: (id: string) => void;
  onSelectStation: (station: Station) => void;
  onBookStation: (station: Station) => void;
  onRequestLocation?: () => void;
  isLocating?: boolean;
  initialQuery?: string;
  initialType?: 'ALL' | StationType;
  initialRadius?: number;
}

export const StationFinder: React.FC<StationFinderProps> = ({
  stations,
  userCoords,
  userAddress,
  userVillage,
  favourites,
  onToggleFavourite,
  onSelectStation,
  onBookStation,
  onRequestLocation,
  isLocating,
  initialQuery = '',
  initialType = 'ALL',
  initialRadius = 25,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<'ALL' | StationType>(initialType);
  const [radiusKm, setRadiusKm] = useState<number>(initialRadius);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [viewMode, setViewMode] = useState<'both' | 'list' | 'map'>('both');
  const [selectedStationId, setSelectedStationId] = useState<string | undefined>();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filtered & sorted stations with distance calculation
  const processedStations = useMemo(() => {
    return stations
      .map((station) => {
        const dist = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          station.latitude,
          station.longitude
        );
        return { station, distance: dist };
      })
      .filter(({ station, distance }) => {
        // Query search
        if (query.trim()) {
          const q = query.toLowerCase();
          const matches =
            station.name.toLowerCase().includes(q) ||
            station.address.toLowerCase().includes(q) ||
            station.city.toLowerCase().includes(q) ||
            station.operator.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Fuel Type
        if (selectedType !== 'ALL') {
          if (station.type !== selectedType && station.type !== 'HYBRID') {
            return false;
          }
        }

        // Radius
        if (distance > radiusKm) {
          return false;
        }

        // Only Available bays
        if (onlyAvailable) {
          const hasFree = station.bays.some((b) => b.status === 'AVAILABLE');
          if (!hasFree) return false;
        }

        // Connector Filter
        if (selectedConnector !== 'ALL') {
          const hasConnector = station.bays.some((b) => b.connectorType === selectedConnector);
          if (!hasConnector) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return a.distance - b.distance;
        }
        if (sortBy === 'rating') {
          return b.station.rating - a.station.rating;
        }
        if (sortBy === 'price') {
          const minPriceA = Math.min(...a.station.bays.map((b) => b.pricePerUnit));
          const minPriceB = Math.min(...b.station.bays.map((b) => b.pricePerUnit));
          return minPriceA - minPriceB;
        }
        return 0;
      });
  }, [stations, userCoords, query, selectedType, radiusKm, onlyAvailable, selectedConnector, sortBy]);

  const handleResetFilters = () => {
    setQuery('');
    setSelectedType('ALL');
    setRadiusKm(50);
    setOnlyAvailable(false);
    setSelectedConnector('ALL');
    setSortBy('distance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Real Origin Location Status Bar */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-blue-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border border-blue-200/50">
            📍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                Your Starting Location (Origin)
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 font-bold border border-emerald-200/70 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {userVillage || 'Village / Local Area'}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {userAddress || 'Detecting your neighborhood / village...'}
            </div>
            <div className="text-[11px] text-slate-500">
              Distances & routes are computed from this starting point in real time.
            </div>
          </div>
        </div>

        {onRequestLocation && (
          <button
            onClick={onRequestLocation}
            disabled={isLocating}
            className="px-4 py-2.5 text-xs font-bold text-blue-700 bg-blue-50/90 hover:bg-blue-100/90 active:bg-blue-200/80 rounded-2xl transition-all duration-200 flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs hover-lift-subtle press-effect cursor-pointer border border-blue-200/50"
          >
            <Compass className={`w-4 h-4 ${isLocating ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
            <span>{isLocating ? 'Detecting GPS...' : 'Update My GPS Location'}</span>
          </button>
        )}
      </div>

      {/* Top Header & Search Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Charging & Refuelling Hubs
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Displaying <span className="font-bold text-slate-900 tabular-nums">{processedStations.length}</span> verified stations within {radiusKm} km of your location.
          </p>
        </div>

        {/* View Mode Switcher (Zero-pill button group) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              onClick={() => setViewMode('both')}
              className={`hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                viewMode === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Full Map</span>
            </button>
          </div>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs press-effect"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Desktop Inline, Mobile Collapsible) */}
      <div
        className={`bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4 ${
          filterDrawerOpen ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search station name, area, or operator..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all font-medium"
            />
          </div>

          {/* Fuel Segmented Filter */}
          <div className="lg:col-span-3 flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                selectedType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('EV')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                selectedType === 'EV' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>EV</span>
            </button>
            <button
              onClick={() => setSelectedType('CNG')}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer ${
                selectedType === 'CNG' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Fuel className="w-3 h-3 text-sky-600" />
              <span>CNG</span>
            </button>
          </div>

          {/* Radius selector */}
          <div className="lg:col-span-2">
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer font-medium transition-all"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>

          {/* Sort selector */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer font-medium transition-all"
            >
              <option value="distance">Sort: Nearest First</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="price">Sort: Lowest Price</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all press-effect cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Filters: Connector Type & Bay Availability Checkbox */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Connector:</span>
            {['ALL', 'CCS-2', 'Type-2 AC', 'Fast-Fill CNG'].map((conn) => (
              <button
                key={conn}
                onClick={() => setSelectedConnector(conn)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer press-effect ${
                  selectedConnector === conn
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {conn === 'ALL' ? 'Any Standard' : conn}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition-colors"
            />
            <span>Show Only Stations With Open Bays Right Now</span>
          </label>
        </div>
      </div>

      {/* Main View Area: Split or Single */}
      {processedStations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-900">No stations match your current criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try expanding the search radius beyond {radiusKm} km, switching fuel type to &quot;All Types&quot;, or clearing the connector filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-block"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Split Mode (Desktop: Grid on left, Map on right) */}
          {viewMode === 'both' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Scrollable cards list */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[750px] overflow-y-auto pr-1">
                {processedStations.map(({ station, distance }) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    distanceKm={distance}
                    userCoords={userCoords}
                    isFavourite={favourites.includes(station.id)}
                    onToggleFavourite={onToggleFavourite}
                    onSelect={(s) => {
                      setSelectedStationId(s.id);
                      onSelectStation(s);
                    }}
                    onBook={onBookStation}
                  />
                ))}
              </div>

              {/* Right Column: Sticky Leaflet Map */}
              <div className="lg:col-span-5 sticky top-20">
                <StationMap
                  stations={processedStations.map((item) => item.station)}
                  userCoords={userCoords}
                  userAddress={userAddress}
                  selectedStationId={selectedStationId}
                  onSelectStation={(s) => {
                    setSelectedStationId(s.id);
                    onSelectStation(s);
                  }}
                  onBookStation={onBookStation}
                  onRequestLocation={onRequestLocation}
                />
              </div>
            </div>
          )}

          {/* List Only Mode */}
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedStations.map(({ station, distance }) => (
                <StationCard
                  key={station.id}
                  station={station}
                  distanceKm={distance}
                  userCoords={userCoords}
                  isFavourite={favourites.includes(station.id)}
                  onToggleFavourite={onToggleFavourite}
                  onSelect={onSelectStation}
                  onBook={onBookStation}
                />
              ))}
            </div>
          )}

          {/* Map Only Mode */}
          {viewMode === 'map' && (
            <div>
              <StationMap
                stations={processedStations.map((item) => item.station)}
                userCoords={userCoords}
                userAddress={userAddress}
                selectedStationId={selectedStationId}
                onSelectStation={onSelectStation}
                onBookStation={onBookStation}
                onRequestLocation={onRequestLocation}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
