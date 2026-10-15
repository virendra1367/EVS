import React, { useState } from 'react';
import { Booking, UserProfile, Station } from '../types';
import { cancelBooking, getStations } from '../utils/storage';
import { getDirectionsUrl } from '../utils/geo';
import { Calendar, Clock, Car, Zap, Fuel, AlertCircle, XCircle, CheckCircle, Navigation, Plus, Trash2, Heart } from 'lucide-react';

interface UserDashboardProps {
  currentUser: UserProfile;
  bookings: Booking[];
  onRefreshBookings: () => void;
  onBookStation: (station: Station) => void;
  onUpdateVehicles: (vehicles: UserProfile['vehicles']) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  bookings,
  onRefreshBookings,
  onBookStation,
  onUpdateVehicles,
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'VEHICLES' | 'FAVOURITES'>('UPCOMING');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // New vehicle form state
  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newFuelType, setNewFuelType] = useState<'EV' | 'CNG'>('EV');
  const [newBatterySize, setNewBatterySize] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Filter bookings for current user
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const upcomingBookings = userBookings.filter((b) => b.bookingStatus === 'CONFIRMED');
  const completedBookings = userBookings.filter((b) => b.bookingStatus === 'COMPLETED');
  const cancelledBookings = userBookings.filter((b) => b.bookingStatus === 'CANCELLED');

  const allStations = getStations();

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    const ok = cancelBooking(cancelModalBooking.id, currentUser.id, 'User initiated cancellation from dashboard');
    if (ok) {
      onRefreshBookings();
      setCancelModalBooking(null);
    }
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim() || !newPlate.trim()) return;

    const newVehicle = {
      id: `veh-${Date.now()}`,
      model: newModel.trim(),
      registrationNumber: newPlate.trim().toUpperCase(),
      fuelType: newFuelType,
      batteryOrTankSize: newBatterySize.trim() || (newFuelType === 'EV' ? '40 kWh' : '10 kg'),
    };

    const updated = [...currentUser.vehicles, newVehicle];
    onUpdateVehicles(updated);
    setNewModel('');
    setNewPlate('');
    setNewBatterySize('');
    setShowAddVehicle(false);
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    const updated = currentUser.vehicles.filter((v) => v.id !== vehicleId);
    onUpdateVehicles(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* User Overview Profile Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{currentUser.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase border border-emerald-200/60">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {currentUser.email} · {currentUser.phone}
            </p>
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-3 gap-3.5">
          <div className="px-4 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-center hover-lift-subtle transition-all">
            <div className="text-lg font-extrabold text-emerald-700 tabular-nums">
              {upcomingBookings.length}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">Upcoming Slots</div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-center hover-lift-subtle transition-all">
            <div className="text-lg font-extrabold text-slate-900 tabular-nums">
              {completedBookings.length}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">Completed Sessions</div>
          </div>

          <div className="px-4 py-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-center hover-lift-subtle transition-all">
            <div className="text-lg font-extrabold text-slate-900 tabular-nums">
              {currentUser.vehicles.length}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-0.5">Saved Vehicles</div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl max-w-fit border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'UPCOMING' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Upcoming Bookings ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Past Sessions ({completedBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'CANCELLED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cancelled ({cancelledBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('VEHICLES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'VEHICLES' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Vehicle Garage
        </button>
      </div>

      {/* TAB CONTENT: UPCOMING BOOKINGS */}
      {activeTab === 'UPCOMING' && (
        <div className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Upcoming Reservations</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need to charge your EV or refill CNG? Browse stations on the interactive map and reserve a guaranteed slot.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 hover:border-emerald-500 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-800">
                        CONFIRMED RESERVATION
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900">{b.bookingReference}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900">{b.stationName}</h3>
                      <p className="text-xs text-slate-500">{b.stationAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl">
                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Service Bay</div>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          {b.serviceType === 'EV' ? (
                            <Zap className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Fuel className="w-3.5 h-3.5 text-sky-600" />
                          )}
                          <span>{b.bayName}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-400 font-semibold">Date & Slot</div>
                        <div className="font-bold text-slate-900 mt-0.5 tabular-nums">
                          {b.bookingDate}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold tabular-nums">
                          {b.timeSlot}
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="text-[10px] text-slate-400 font-semibold">Vehicle</div>
                        <div className="font-bold text-slate-800 mt-0.5 font-mono">
                          {b.vehicleNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{b.vehicleModel}</div>
                      </div>

                      <div className="pt-2">
                        <div className="text-[10px] text-slate-400 font-semibold">Payment Mode</div>
                        <div className="font-bold text-slate-800 mt-0.5">
                          ₹{b.estimatedAmount} est.
                        </div>
                        <div className="text-[10px] text-slate-500">Pay at Station</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setCancelModalBooking(b)}
                      className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Slot</span>
                    </button>

                    <a
                      href={getDirectionsUrl(18.5204, 73.8567, b.stationName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: COMPLETED SESSIONS */}
      {activeTab === 'COMPLETED' && (
        <div className="space-y-3">
          {completedBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No completed sessions yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Station</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Bay / Connector</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {completedBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                        <td className="p-3 font-semibold text-slate-800">{b.stationName}</td>
                        <td className="p-3 tabular-nums">
                          {b.bookingDate} · {b.timeSlot}
                        </td>
                        <td className="p-3">{b.bayName}</td>
                        <td className="p-3 font-mono">{b.vehicleNumber}</td>
                        <td className="p-3 font-bold text-slate-900 tabular-nums">₹{b.estimatedAmount}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CANCELLED */}
      {activeTab === 'CANCELLED' && (
        <div className="space-y-3">
          {cancelledBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No cancelled bookings.
            </div>
          ) : (
            <div className="space-y-3">
              {cancelledBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{b.stationName}</div>
                    <div className="text-slate-500 mt-0.5">
                      Ref: <span className="font-mono">{b.bookingReference}</span> · Slot was: {b.bookingDate} ({b.timeSlot})
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold bg-slate-100 text-slate-600 rounded">
                    CANCELLED & RELEASED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: VEHICLE GARAGE */}
      {activeTab === 'VEHICLES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Vehicles</h2>
              <p className="text-xs text-slate-500">
                Save your EV and CNG vehicle profiles for 1-click slot booking
              </p>
            </div>
            <button
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {/* Add Vehicle Drawer */}
          {showAddVehicle && (
            <form onSubmit={handleAddVehicle} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Vehicle Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vehicle Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Tata Tiago EV or Ertiga CNG"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Registration Plate</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. MH 12 AB 1234"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg uppercase font-mono text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fuel Category</label>
                  <select
                    value={newFuelType}
                    onChange={(e) => setNewFuelType(e.target.value as any)}
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="CNG">Compressed Natural Gas (CNG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Battery / Tank Capacity</label>
                  <input
                    type="text"
                    value={newBatterySize}
                    onChange={(e) => setNewBatterySize(e.target.value)}
                    placeholder="e.g. 24 kWh or 10 kg CNG"
                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicle(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save to Garage
                </button>
              </div>
            </form>
          )}

          {/* Vehicle List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentUser.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      {v.fuelType === 'EV' ? 'Electric (EV)' : 'CNG Clean Fuel'}
                    </span>
                    <button
                      onClick={() => handleRemoveVehicle(v.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2">{v.model}</h3>
                  <div className="font-mono text-xs font-bold text-emerald-800 mt-1">
                    {v.registrationNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Capacity: {v.batteryOrTankSize}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Cancel Slot Reservation?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingReference}</strong> for {cancelModalBooking.stationName}?
              The reserved bay will immediately be released and made available to other drivers in real time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Yes, Cancel & Release Bay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
