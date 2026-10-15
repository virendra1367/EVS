import React from 'react';
import { Station } from '../types';
import { getDirectionsUrl, formatOpenDays, Coordinates } from '../utils/geo';
import { Zap, Fuel, Navigation, Heart, ChevronRight, Clock, Calendar } from 'lucide-react';

interface StationCardProps {
  station: Station;
  distanceKm: number;
  userCoords?: Coordinates;
  isFavourite: boolean;
  onToggleFavourite: (id: string) => void;
  onSelect: (station: Station) => void;
  onBook: (station: Station) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  distanceKm,
  userCoords,
  isFavourite,
  onToggleFavourite,
  onSelect,
  onBook,
}) => {
  const availableBays = station.bays.filter((b) => b.status === 'AVAILABLE').length;
  const isEv = station.type === 'EV' || station.type === 'HYBRID';
  const isCng = station.type === 'CNG' || station.type === 'HYBRID';

  // Find lowest price
  const evBays = station.bays.filter((b) => b.serviceType === 'EV');
  const cngBays = station.bays.filter((b) => b.serviceType === 'CNG');
  const minEvPrice = evBays.length > 0 ? Math.min(...evBays.map((b) => b.pricePerUnit)) : null;
  const minCngPrice = cngBays.length > 0 ? Math.min(...cngBays.map((b) => b.pricePerUnit)) : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover-lift flex flex-col justify-between group overflow-hidden transition-all duration-300 hover:border-emerald-500/40">
      <div>
        {/* Card Header Media & Badges */}
        <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          {/* Top Overlays */}
          <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between">
            {/* Status & Service indicator */}
            <div className="flex items-center gap-1.5">
              <span
                className={`px-3 py-1 text-[11px] font-bold rounded-xl shadow-xs backdrop-blur-md transition-colors ${
                  station.operationalStatus === 'OPERATIONAL'
                    ? 'bg-emerald-600/95 text-white'
                    : station.operationalStatus === 'BUSY'
                    ? 'bg-amber-600/95 text-white'
                    : 'bg-rose-600/95 text-white'
                }`}
              >
                {station.operationalStatus === 'OPERATIONAL'
                  ? 'Operational'
                  : station.operationalStatus === 'BUSY'
                  ? 'High Demand'
                  : 'Maintenance'}
              </span>

              <span className="px-2.5 py-1 text-[11px] font-bold bg-white/95 text-slate-800 rounded-xl shadow-xs backdrop-blur-md border border-slate-200/50">
                {station.type === 'HYBRID' ? 'EV + CNG' : station.type}
              </span>
            </div>

            {/* Favourite bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(station.id);
              }}
              title={isFavourite ? 'Remove from saved' : 'Save station'}
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-600 hover:text-rose-600 shadow-xs transition-all duration-200 press-effect hover:scale-105 cursor-pointer border border-slate-200/50"
            >
              <Heart className={`w-4 h-4 transition-transform duration-200 ${isFavourite ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
            </button>
          </div>

          {/* Bottom gradient scrim with distance */}
          <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent flex items-center justify-between text-white text-xs">
            <span className="font-bold tracking-wide tabular-nums text-white flex items-center gap-1">
              <span>{distanceKm} km away</span>
            </span>
            <span className="text-[11px] text-emerald-300 font-bold bg-slate-950/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-emerald-400/30">
              {availableBays} / {station.bays.length} Bays Free
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          {/* Unboxed clean metadata (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{station.operator}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-amber-700">★ {station.rating} ({station.reviewsCount})</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{station.is24x7 ? '24/7' : `${station.openingTime}-${station.closingTime}`}</span>
            </span>
          </div>

          {/* Operating Days */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900 bg-emerald-50/80 px-2.5 py-1 rounded-xl border border-emerald-100">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{formatOpenDays(station.openDays)}</span>
          </div>

          {/* Station Title */}
          <div>
            <h3
              onClick={() => onSelect(station)}
              className="font-bold text-slate-900 text-base leading-snug hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1"
            >
              {station.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-normal">{station.address}</p>
          </div>

          {/* Connectors & Pricing preview */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2.5 text-xs">
            {isEv && (
              <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 transition-colors group-hover:border-slate-200">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>EV Connectors</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 truncate font-medium">
                  {evBays.map((b) => b.connectorType).join(', ')}
                </div>
                {minEvPrice && (
                  <div className="text-xs font-bold text-slate-900 mt-1.5 tabular-nums">
                    ₹{minEvPrice} <span className="text-[10px] font-normal text-slate-500">/ kWh</span>
                  </div>
                )}
              </div>
            )}

            {isCng && (
              <div className="bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100 transition-colors group-hover:border-slate-200">
                <div className="flex items-center gap-1 text-[11px] font-bold text-sky-800">
                  <Fuel className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>CNG Dispensers</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-1 truncate font-medium">
                  200–220 bar Cascade
                </div>
                {minCngPrice && (
                  <div className="text-xs font-bold text-slate-900 mt-1.5 tabular-nums">
                    ₹{minCngPrice} <span className="text-[10px] font-normal text-slate-500">/ kg</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 flex items-center gap-2">
        <button
          onClick={() => onBook(station)}
          disabled={station.operationalStatus === 'CLOSED'}
          className="flex-1 py-2.5 px-3.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all duration-200 text-center cursor-pointer hover-lift-subtle press-effect"
        >
          Book Slot
        </button>

        <button
          onClick={() => onSelect(station)}
          className="py-2.5 px-3.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/90 rounded-xl transition-all duration-200 flex items-center gap-1 cursor-pointer press-effect"
          title="Inspect details and bay availability"
        >
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <a
          href={getDirectionsUrl(
            station.latitude,
            station.longitude,
            station.name,
            userCoords?.latitude,
            userCoords?.longitude
          )}
          target="_blank"
          rel="noopener noreferrer"
          title="Get turn-by-turn directions from your location"
          className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-all duration-200 press-effect"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
