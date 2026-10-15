import React, { useState } from 'react';
import { StationType } from '../types';
import { Search, MapPin, Navigation, SlidersHorizontal, ArrowRight, Zap, Fuel, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (filters: {
    query: string;
    type: 'ALL' | StationType;
    radiusKm: number;
  }) => void;
  onExploreMap: () => void;
  onQuickBook: () => void;
  userCity: string;
  onRequestLocation: () => void;
  isLocating: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onExploreMap,
  onQuickBook,
  userCity,
  onRequestLocation,
  isLocating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fuelType, setFuelType] = useState<'ALL' | StationType>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(15);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query: searchQuery,
      type: fuelType,
      radiusKm,
    });
  };

  return (
    <section className="relative bg-[#101A2C] bg-subtle-grid-dark text-white overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-800/80">
      {/* Subtle ambient lighting gradients */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-gradient-to-tr from-teal-500/12 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Heading, Supporting text, CTAs and Large Search Bar */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/25 text-emerald-400 text-xs font-bold tracking-wide backdrop-blur-md shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ChargeGo Intelligent Mobility</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-normal">Smarter Stops. Cleaner Journeys.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Find Your Next <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                  Clean-Energy Stop.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Discover verified EV charging stations and high-pressure CNG refuelling hubs across your route. Check live connector availability, power ratings, and secure guaranteed time slots in advance to travel without delays.
              </p>
            </div>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() =>
                  onSearch({
                    query: searchQuery,
                    type: fuelType,
                    radiusKm,
                  })
                }
                className="px-6 py-3.5 text-sm font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center gap-2 cursor-pointer hover-lift press-effect"
              >
                <span>Find Nearby Stations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreMap}
                className="px-6 py-3.5 text-sm font-bold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl transition-all duration-200 flex items-center gap-2 cursor-pointer hover-lift-subtle press-effect"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>Explore the Map</span>
              </button>
            </div>

            {/* Prominent Search & Filter Panel */}
            <div className="bg-white/98 backdrop-blur-xl text-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 p-5 sm:p-6 mt-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full pointer-events-none" />

              <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10">
                {/* Prominent EV / CNG Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl max-w-fit border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setFuelType('ALL')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                      fuelType === 'ALL'
                        ? 'bg-[#101A2C] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Stations
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('EV')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      fuelType === 'EV'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>EV Charging</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('CNG')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      fuelType === 'CNG'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>CNG Refuelling</span>
                  </button>
                </div>

                {/* Search inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8 relative">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Location / Neighborhood
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search area (e.g. Shivajinagar, Baner, Kothrud)..."
                        className="w-full pl-9 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                      />
                      <button
                        type="button"
                        onClick={onRequestLocation}
                        disabled={isLocating}
                        title="Detect GPS location"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Radius
                    </label>
                    <div className="relative">
                      <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 cursor-pointer font-medium"
                      >
                        <option value={5}>Within 5 km</option>
                        <option value={10}>Within 10 km</option>
                        <option value={15}>Within 15 km</option>
                        <option value={25}>Within 25 km</option>
                        <option value={50}>Within 50 km</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Origin: <strong>{userCity}</strong></span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#101A2C] hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Find Stations
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: High Quality EV Charging Station Visual */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/70 shadow-2xl bg-slate-900 aspect-[16/11] lg:h-[480px] group hover-lift-subtle">
              <img
                src="/src/assets/images/hero_ev_cng_hub_1791912523070.jpg"
                alt="ChargeGo modern EV fast-charging and clean CNG multi-fuel mobility hub"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101A2C] via-[#101A2C]/40 to-transparent flex flex-col justify-end p-6 sm:p-7 text-white">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 bg-slate-950/80 backdrop-blur-md px-3.5 py-1 rounded-full max-w-fit border border-emerald-400/30 mb-2.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Clean-Energy Hubs</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Ultra-Fast DC Charging & 220 bar CNG
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
                  Real-time status monitoring with guaranteed slot holds. No waiting, no guesswork on connector availability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift-subtle transition-all duration-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">8+ Stations</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">Nearby Verified Hubs</div>
          </div>

          <div className="p-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift-subtle transition-all duration-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums tracking-tight">24 Available</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Live Charging & Fuel Slots</div>
          </div>

          <div className="p-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift-subtle transition-all duration-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 tabular-nums tracking-tight">EV + CNG</div>
            <div className="text-xs font-semibold text-slate-300 mt-1">Supported Clean Fuels</div>
          </div>

          <div className="p-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-slate-700 hover-lift-subtle transition-all duration-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">0 min Wait</div>
            <div className="text-xs font-semibold text-emerald-400 mt-1">With Advance Booking</div>
          </div>
        </div>
      </div>
    </section>
  );
};
