import React from 'react';
import { X, Zap, Fuel, Navigation, ShieldCheck, Clock, CheckCircle2, Award } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  onExploreStations: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, onExploreStations }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#101A2C] px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#101A2C] flex items-center justify-center font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                About ChargeGo
              </h2>
              <p className="text-xs text-emerald-400 font-medium">Smarter Stops. Cleaner Journeys.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Mission statement */}
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Our Mobility Mission
            </span>
            <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
              ChargeGo is an intelligent, clean-energy mobility discovery and slot reservation platform designed to eliminate waiting lines and range anxiety for EV and CNG drivers.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Rapid EV Charging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect to verified high-power DC fast chargers (CCS-2, Type-2 AC, CHAdeMO) with real-time connector status, power kW ratings, and per-kWh transparent pricing.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                <Fuel className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">High-Pressure CNG</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Locate 200–220 bar mother and daughter CNG stations with guaranteed pressure dispensing, bypass long commercial queues, and check daily price per kg.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Guaranteed Slot Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reserve dedicated time slots before departure. Our concurrency-safe bay allocation locks capacity so your dispenser is ready upon arrival.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Intelligent Geo-Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Calculates precise road distances from your real GPS coordinates, plots live driving geometry, and links directly to turn-by-turn navigation.
              </p>
            </div>
          </div>

          {/* Operating schedule info */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Flexible Operating Schedules & Verification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every station specifies its verified operating days (e.g. All Days Mon–Sun, or Mon–Sat) and hours, ensuring drivers never arrive at closed gates.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">ChargeGo Platform v2.4</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onExploreStations();
              }}
              className="px-5 py-2 text-xs font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 rounded-xl transition-all shadow-md"
            >
              Explore Stations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
