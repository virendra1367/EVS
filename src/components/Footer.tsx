import React from 'react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAbout, onOpenContact }) => {
  return (
    <footer className="bg-[#101A2C] text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-base">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#101A2C] flex items-center justify-center font-black text-xs shadow-md">
                ⚡
              </span>
              <span className="text-lg">ChargeGo</span>
            </div>
            <p className="text-emerald-400 text-xs font-semibold">
              Smarter Stops. Cleaner Journeys.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Discover verified EV rapid chargers and high-pressure CNG stations with live availability and guaranteed advance slot reservations.
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Platform</div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Find Stations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('bookings');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  My Bookings
                </button>
              </li>
              {onOpenAbout && (
                <li>
                  <button
                    onClick={onOpenAbout}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    About ChargeGo
                  </button>
                </li>
              )}
              {onOpenContact && (
                <li>
                  <button
                    onClick={onOpenContact}
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Contact & 24/7 Helpline
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Supported Protocols */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Charging & Fuel Standards</div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>• CCS-2 DC Rapid (60kW – 150kW)</li>
              <li>• Type-2 AC Fast Charging (22kW)</li>
              <li>• CHAdeMO & GB/T Compatible</li>
              <li>• Fast-Fill CNG (200 – 220 bar)</li>
              <li>• Standard Multi-Point CNG Dispenser</li>
            </ul>
          </div>

          {/* Operating Support & Contact Info */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider">Driver Support</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Need assistance en route or at a charging bay? Our operations team monitors dispenser availability and queue status round the clock.
            </p>
            <div className="text-xs text-emerald-400 font-bold pt-1">
              📞 +91 1800 209 8658 (Toll-Free)
            </div>
            <div className="text-xs text-slate-300">
              ✉️ support@chargego.org
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              © {new Date().getFullYear()} ChargeGo Mobility Network. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
