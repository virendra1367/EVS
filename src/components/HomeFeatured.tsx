import React from 'react';
import { Station } from '../types';
import { StationCard } from './StationCard';
import { calculateDistance, Coordinates } from '../utils/geo';
import { ArrowRight, Search, CalendarCheck, Zap, ShieldCheck } from 'lucide-react';

interface HomeFeaturedProps {
  stations: Station[];
  userCoords: Coordinates;
  favourites: string[];
  onToggleFavourite: (id: string) => void;
  onSelectStation: (station: Station) => void;
  onBookStation: (station: Station) => void;
  onExploreAll: () => void;
}

export const HomeFeatured: React.FC<HomeFeaturedProps> = ({
  stations,
  userCoords,
  favourites,
  onToggleFavourite,
  onSelectStation,
  onBookStation,
  onExploreAll,
}) => {
  // Sort by proximity to user for real nearby stations preview
  const nearbyStations = [...stations]
    .map((station) => ({
      station,
      dist: calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        station.latitude,
        station.longitude
      ),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3);

  return (
    <div className="space-y-16 py-14 bg-[#F8FAFC] bg-subtle-grid">
      {/* 3-Step Simple 'Search, Book, Go' Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2.5 mb-12">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50/90 px-3.5 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
            Frictionless Clean Transit
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#101A2C] tracking-tight">
            Search, Book, Go.
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Three simple steps to bypass charging queues and refuelling congestion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover-lift transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-[#101A2C] text-emerald-400 flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
              01
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Step One</span>
            </div>
            <h3 className="font-extrabold text-xl text-[#101A2C] tracking-tight">Search & Filter</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Find verified EV rapid chargers and 220 bar CNG dispensers near your current GPS position or destination. Filter by connector type, price, and live bay availability.
            </p>
          </div>

          <div className="p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover-lift transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-[#101A2C] flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
              02
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Step Two</span>
            </div>
            <h3 className="font-extrabold text-xl text-[#101A2C] tracking-tight">Book Time Slot</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Choose your date and guaranteed 30 or 45-minute charging window. Our atomic booking engine reserves your dispenser so you never face a taken slot.
            </p>
          </div>

          <div className="p-8 bg-white/95 backdrop-blur-sm rounded-3xl border border-slate-200/90 shadow-sm space-y-4 hover-lift transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-[#101A2C] text-emerald-400 flex items-center justify-center font-black text-base shadow-md group-hover:scale-105 transition-transform">
              03
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wide">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Step Three</span>
            </div>
            <h3 className="font-extrabold text-xl text-[#101A2C] tracking-tight">Go & Power Up</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Follow turn-by-turn road directions to your station. Flash your digital pass QR code at the bay, plug in or refuel without waiting, and pay seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* 'Nearby Stations' Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-900 text-xs font-bold border border-emerald-200/80 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verified Clean Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101A2C] tracking-tight">
              Nearby Stations Preview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Closest high-power EV charging dispensers and CNG stations sorted by road distance from your location.
            </p>
          </div>

          <button
            onClick={onExploreAll}
            className="px-5 py-2.5 text-xs font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer hover-lift-subtle press-effect"
          >
            <span>Explore All On Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyStations.map(({ station, dist }) => (
            <StationCard
              key={station.id}
              station={station}
              distanceKm={dist}
              userCoords={userCoords}
              isFavourite={favourites.includes(station.id)}
              onToggleFavourite={onToggleFavourite}
              onSelect={onSelectStation}
              onBook={onBookStation}
            />
          ))}
        </div>
      </div>

      {/* ChargeGo Value Proposition Callout Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#101A2C] bg-subtle-grid-dark rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-2xl relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              ChargeGo Driver Guarantee
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
              Ready to guarantee your next charging or CNG refuelling stop?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Compare bay connectors, verify operating days and hours, view exact road distances from your coordinates, and secure your slot before you roll out.
            </p>
          </div>

          <button
            onClick={onExploreAll}
            className="px-7 py-3.5 text-sm font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 shrink-0 cursor-pointer self-start lg:self-auto hover-lift press-effect relative z-10"
          >
            <span>Explore The Station Network</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
