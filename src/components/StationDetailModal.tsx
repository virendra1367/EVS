import React, { useState } from 'react';
import { Station } from '../types';
import { calculateDistance, getDirectionsUrl, formatOpenDays, Coordinates } from '../utils/geo';
import { X, Navigation, Phone, Clock, ShieldCheck, Zap, Fuel, Flag, CheckCircle, Calendar } from 'lucide-react';

interface StationDetailModalProps {
  station: Station;
  userCoords: Coordinates;
  onClose: () => void;
  onBook: (station: Station, preferredBayId?: string) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  userCoords,
  onClose,
  onBook,
}) => {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportText, setReportText] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const distanceKm = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    station.latitude,
    station.longitude
  );

  const availableBays = station.bays.filter((b) => b.status === 'AVAILABLE').length;

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSubmitted(false);
      setReportText('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Modal Header Media */}
        <div className="relative h-60 sm:h-72 w-full bg-slate-900">
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
            title="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrim Overlay with Title */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 text-white">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">
                {station.type === 'HYBRID' ? 'EV + CNG Hub' : station.type}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{station.dataSource.replace('_', ' ')}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums font-bold">{distanceKm} km from you</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 text-white leading-tight">
              {station.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-1">{station.address}, {station.city}</p>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-280px)] overflow-y-auto">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Operating Status</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${station.operationalStatus === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{station.operationalStatus}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hours & Days</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{station.is24x7 ? '24 Hours' : `${station.openingTime} – ${station.closingTime}`}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatOpenDays(station.openDays)}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live Availability</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5 tabular-nums">
                {availableBays} of {station.bays.length} Bays Free
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Station Phone</div>
              <div className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{station.contactPhone}</span>
              </div>
            </div>
          </div>

          {/* Service Bays List */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Service Bays & Charging Dispensers
              </h3>
              <span className="text-xs text-slate-500">Pick a bay to reserve a guaranteed slot</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {station.bays.map((bay) => {
                const isEv = bay.serviceType === 'EV';
                return (
                  <div
                    key={bay.id}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-500/60 bg-white shadow-2xs hover-lift-subtle transition-all duration-200 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          {isEv ? (
                            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Fuel className="w-4 h-4 text-sky-600 shrink-0" />
                          )}
                          <span>{bay.bayNumber}</span>
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            bay.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                              : 'bg-amber-50 text-amber-800 border-amber-200/60'
                          }`}
                        >
                          {bay.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 mt-1 font-medium">
                        <strong>{bay.connectorType}</strong>
                        {bay.powerKw && <span> · {bay.powerKw} kW DC Fast</span>}
                        {bay.pressureBar && <span> · {bay.pressureBar} bar High Flow</span>}
                      </div>

                      <div className="text-xs font-bold text-slate-900 mt-2 tabular-nums">
                        Rate: ₹{bay.pricePerUnit} <span className="text-[11px] font-normal text-slate-500">per {bay.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onBook(station, bay.id)}
                      className="mt-2 w-full py-2 px-3 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-600 hover:text-white active:scale-98 rounded-xl transition-all duration-200 text-center press-effect cursor-pointer border border-emerald-200/50"
                    >
                      Reserve {bay.bayNumber}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Facility Features */}
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-2.5 tracking-tight">On-Site Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {station.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 text-xs font-medium bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 shadow-2xs"
                >
                  ✓ {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Report incorrect info toggle */}
          <div className="pt-3 border-t border-slate-100">
            {!showReportForm ? (
              <button
                onClick={() => setShowReportForm(true)}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>Report incorrect pricing or station status</span>
              </button>
            ) : (
              <form onSubmit={handleReportSubmit} className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Feedback / Correction for Station Admin</span>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                {reportSubmitted ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Thank you! Your feedback has been queued for verification.</span>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="e.g. Bay 2 connector reported offline, or CNG pressure lower than 200 bar..."
                      rows={2}
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all press-effect cursor-pointer"
                    >
                      Submit Community Report
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between gap-3">
          <a
            href={getDirectionsUrl(
              station.latitude,
              station.longitude,
              station.name,
              userCoords.latitude,
              userCoords.longitude
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100/90 border border-slate-300 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs hover-lift-subtle press-effect"
          >
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Directions from My Location</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onBook(station)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-all hover-lift-subtle press-effect cursor-pointer"
            >
              Book Time Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
