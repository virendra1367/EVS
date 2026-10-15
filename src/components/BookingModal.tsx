import React, { useState, useMemo } from 'react';
import { Station, ServiceBay, Booking, UserProfile } from '../types';
import { generateTimeSlots, isSlotBooked, createBooking } from '../utils/storage';
import { getDirectionsUrl, isStationOpenOnDate, formatOpenDays } from '../utils/geo';
import { X, CheckCircle, AlertTriangle, Calendar, Clock, Car, Zap, Fuel, Printer, ArrowRight, ShieldCheck } from 'lucide-react';

interface BookingModalProps {
  stations: Station[];
  initialStation?: Station;
  initialBayId?: string;
  currentUser: UserProfile;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  stations,
  initialStation,
  initialBayId,
  currentUser,
  onClose,
  onBookingSuccess,
}) => {
  // Step tracking: 1: Station & Bay, 2: Date & Slot, 3: Vehicle & Contact, 4: Confirmation Pass
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStation ? 2 : 1);

  // Selected state
  const [selectedStation, setSelectedStation] = useState<Station>(initialStation || stations[0]);
  const [selectedBayId, setSelectedBayId] = useState<string>(
    initialBayId || initialStation?.bays[0]?.id || stations[0]?.bays[0]?.id || ''
  );

  // Date selection (default today: YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Vehicle & contact details
  const [vehicleModel, setVehicleModel] = useState<string>(
    currentUser.vehicles[0]?.model || 'Tata Nexon EV Max'
  );
  const [vehicleNumber, setVehicleNumber] = useState<string>(
    currentUser.vehicles[0]?.registrationNumber || 'MH 12 TE 8840'
  );
  const [driverName, setDriverName] = useState<string>(currentUser.name);
  const [driverPhone, setDriverPhone] = useState<string>(currentUser.phone);
  const [driverEmail, setDriverEmail] = useState<string>(currentUser.email);

  // Concurrency & Booking state
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available bays for selected station
  const currentBays = selectedStation?.bays || [];
  const selectedBay: ServiceBay | undefined = currentBays.find((b) => b.id === selectedBayId) || currentBays[0];

  // Generate slots based on bay duration
  const timeSlots = useMemo(() => {
    if (!selectedBay) return [];
    return generateTimeSlots(6, 23, selectedBay.slotDurationMinutes || 45);
  }, [selectedBay]);

  // Compute estimated cost
  const estimatedCost = useMemo(() => {
    if (!selectedBay) return 0;
    if (selectedBay.serviceType === 'EV') {
      // average 25 kWh fast charge session
      return Math.round(25 * selectedBay.pricePerUnit);
    } else {
      // average 6 kg CNG refill
      return Math.round(6 * selectedBay.pricePerUnit);
    }
  }, [selectedBay]);

  // Handle station change
  const handleStationChange = (stationId: string) => {
    const st = stations.find((s) => s.id === stationId);
    if (st) {
      setSelectedStation(st);
      if (st.bays.length > 0) {
        setSelectedBayId(st.bays[0].id);
      }
      setSelectedSlot('');
    }
  };

  // Next 5 selectable dates
  const nextDates = useMemo(() => {
    const dates: { dateStr: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const str = d.toISOString().split('T')[0];
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ dateStr: str, label });
    }
    return dates;
  }, []);

  // Atomic confirmation handler
  const handleConfirmReservation = () => {
    if (!selectedBay || !selectedSlot) {
      setBookingError('Please choose an available time slot.');
      return;
    }
    if (!vehicleNumber.trim() || !vehicleModel.trim()) {
      setBookingError('Please provide vehicle registration number and model.');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    // Call storage engine with double-booking concurrency check
    const result = createBooking({
      userId: currentUser.id,
      userName: driverName,
      userEmail: driverEmail,
      userPhone: driverPhone,
      station: selectedStation,
      bay: selectedBay,
      date: selectedDate,
      timeSlot: selectedSlot,
      vehicleModel,
      vehicleNumber,
      estimatedAmount: estimatedCost,
      paymentMode: 'PAY_AT_STATION',
    });

    setIsSubmitting(false);

    if (!result.success) {
      // Concurrency race condition detected!
      setBookingError(result.error || 'This slot is no longer available. Please select another slot.');
      return;
    }

    if (result.booking) {
      setConfirmedBooking(result.booking);
      setStep(4);
      onBookingSuccess(result.booking);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                ⚡
              </span>
              <h2 className="text-base font-bold">ChargeGo Slot Reservation Engine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Guaranteed bay reservation with double-booking prevention
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Only if not confirmed) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <span className={step === 1 ? 'font-bold text-slate-900' : 'text-slate-500'}>
                Station & Bay
              </span>
            </div>
            <div className="w-8 h-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <span className={step === 2 ? 'font-bold text-slate-900' : 'text-slate-500'}>
                Date & Slot
              </span>
            </div>
            <div className="w-8 h-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                  step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </span>
              <span className={step === 3 ? 'font-bold text-slate-900' : 'text-slate-500'}>
                Vehicle & Review
              </span>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="p-6 max-h-[calc(80vh-160px)] overflow-y-auto space-y-5">
          {/* Error Banner */}
          {bookingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>Booking Alert: </strong>
                {bookingError}
              </div>
            </div>
          )}

          {/* STEP 1: Station & Bay selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Select Station</label>
                <select
                  value={selectedStation.id}
                  onChange={(e) => handleStationChange(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium"
                >
                  {stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type}) - {s.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Choose Service Bay / Dispenser
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentBays.map((bay) => (
                    <div
                      key={bay.id}
                      onClick={() => setSelectedBayId(bay.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 hover-lift-subtle press-effect ${
                        selectedBayId === bay.id
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          {bay.serviceType === 'EV' ? (
                            <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Fuel className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          )}
                          <span>{bay.bayNumber}</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                          ₹{bay.pricePerUnit} / {bay.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 font-medium">
                        {bay.connectorType} {bay.powerKw ? `(${bay.powerKw} kW)` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 hover-lift-subtle press-effect cursor-pointer"
                >
                  <span>Select Date & Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Date & Slot selection */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Selected station & bay banner */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{selectedStation.name}</div>
                  <div className="text-slate-500 mt-0.5 font-medium">
                    {selectedBay?.bayNumber} · {selectedBay?.connectorType} · {selectedBay?.slotDurationMinutes} min sessions
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Change Bay
                </button>
              </div>

              {/* Date selection strip */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Select Date</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {nextDates.map(({ dateStr, label }) => (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSelectedSlot('');
                      }}
                      className={`p-2.5 rounded-2xl text-center border transition-all duration-200 text-xs press-effect cursor-pointer ${
                        selectedDate === dateStr
                          ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 border-slate-200 font-medium'
                      }`}
                    >
                      <div className="text-[10px] opacity-75">{label}</div>
                      <div className="font-extrabold text-sm mt-0.5 tabular-nums">{dateStr.split('-')[2]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operating day status check */}
              {!isStationOpenOnDate(selectedDate, selectedStation.openDays) ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Station Closed on Selected Day</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    This station operates on: <strong>{formatOpenDays(selectedStation.openDays)}</strong>.
                    It is not open on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}s. Please choose an open day from above.
                  </p>
                </div>
              ) : (
                /* Slot grid */
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Available Time Slots ({selectedBay?.slotDurationMinutes}m sessions)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Green = Available · Gray = Booked</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1.5 border border-slate-200/80 rounded-2xl bg-slate-50/50">
                    {timeSlots.map((slot) => {
                      const booked = isSlotBooked(selectedStation.id, selectedBay!.id, selectedDate, slot);
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={booked}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all duration-200 ${
                            booked
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                              : isSelected
                              ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm ring-2 ring-emerald-300 press-effect'
                              : 'bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 border-slate-200 press-effect cursor-pointer'
                          }`}
                        >
                          <div className="tabular-nums font-bold">{slot}</div>
                          <div className="text-[10px] mt-0.5 font-normal">
                            {booked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all duration-200 flex items-center gap-1.5 hover-lift-subtle press-effect cursor-pointer"
                >
                  <span>Vehicle Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle details & Payment Review */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary of Slot */}
              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
                <div className="font-extrabold flex items-center justify-between text-sm">
                  <span>{selectedStation.name}</span>
                  <span className="font-black tabular-nums text-emerald-700">₹{estimatedCost} est.</span>
                </div>
                <div className="text-slate-600 flex items-center gap-2 font-medium">
                  <span>{selectedBay?.bayNumber} ({selectedBay?.connectorType})</span>
                  <span>·</span>
                  <span className="font-bold text-slate-900">{selectedDate} @ {selectedSlot}</span>
                </div>
              </div>

              {/* Vehicle input */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>Vehicle Model</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Tata Nexon EV, MG ZS EV, WagonR CNG"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Registration Plate Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. MH 12 TE 8840"
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white uppercase font-mono text-slate-900 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 transition-all font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Option Notice */}
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 text-xs space-y-2">
                <div className="font-bold text-slate-900">Payment Option</div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-500/80 flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span className="font-semibold text-slate-800">Pay at Station (Cash / UPI / Card at Bay)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Zero Convenience Fee</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  *Online gateway payment is disabled in college evaluation mode to prevent test transactions. You simply confirm your slot reservation now and pay upon dispensing at the station.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-400 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-1.5 hover-lift-subtle press-effect cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Verifying Bay...' : 'Confirm Guaranteed Reservation'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Digital Confirmation Pass (QR Code & Printable Receipt) */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl">
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Reservation Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  Your guaranteed time slot has been secured in the ChargeGo network.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div
                id="printable-ticket"
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-4"
              >
                {/* Background watermarked lines */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      ChargeGo Digital Slot Pass
                    </div>
                    <div className="text-lg font-mono font-extrabold text-white">
                      {confirmedBooking.bookingReference}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                    {confirmedBooking.serviceType} PASS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Station</div>
                    <div className="font-bold text-white text-sm truncate">{confirmedBooking.stationName}</div>
                    <div className="text-[11px] text-slate-300 truncate">{confirmedBooking.stationAddress}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Service Bay</div>
                    <div className="font-bold text-white text-sm">{confirmedBooking.bayName}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">{confirmedBooking.connectorType}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Date & Slot</div>
                    <div className="font-bold text-white tabular-nums">{confirmedBooking.bookingDate}</div>
                    <div className="text-emerald-300 font-bold tabular-nums">{confirmedBooking.timeSlot}</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Vehicle / Driver</div>
                    <div className="font-bold text-white font-mono">{confirmedBooking.vehicleNumber}</div>
                    <div className="text-[11px] text-slate-300 truncate">{confirmedBooking.userName}</div>
                  </div>
                </div>

                {/* SVG QR Code Simulation */}
                <div className="p-3 bg-white text-slate-900 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Inline vector QR matrix pattern */}
                    <svg className="w-16 h-16 shrink-0 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                      <rect x="0" y="0" width="30" height="30" rx="4" />
                      <rect x="70" y="0" width="30" height="30" rx="4" />
                      <rect x="0" y="70" width="30" height="30" rx="4" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />
                      <rect x="40" y="10" width="8" height="20" />
                      <rect x="52" y="15" width="8" height="10" />
                      <rect x="40" y="40" width="20" height="20" />
                      <rect x="70" y="40" width="12" height="12" />
                      <rect x="15" y="40" width="15" height="15" />
                      <rect x="70" y="70" width="25" height="10" />
                      <rect x="45" y="75" width="15" height="15" />
                    </svg>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">Show QR at Station Dispenser</div>
                      <div className="text-[11px] text-slate-500">
                        Scan to unlock bay #{confirmedBooking.bayName.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                        Est: ₹{confirmedBooking.estimatedAmount} (Pay at Bay)
                      </div>
                    </div>
                  </div>

                  <a
                    href={getDirectionsUrl(selectedStation.latitude, selectedStation.longitude, selectedStation.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-center"
                  >
                    Directions
                  </a>
                </div>
              </div>

              {/* Pass Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
