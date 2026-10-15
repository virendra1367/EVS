import React, { useState, useMemo } from 'react';
import { Station, Booking, StationType, OperationalStatus, AdminAuditLog } from '../types';
import {
  adminAddStation,
  adminUpdateStation,
  adminDeleteStation,
  updateBookingStatus,
  getAuditLogs,
} from '../utils/storage';
import { formatOpenDays, ALL_DAYS } from '../utils/geo';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Fuel,
  TrendingUp,
  FileText,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';

interface AdminDashboardProps {
  stations: Station[];
  bookings: Booking[];
  adminEmail: string;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stations,
  bookings,
  adminEmail,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STATIONS' | 'BOOKINGS' | 'AUDIT'>('OVERVIEW');

  // Booking filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('ALL');
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>('ALL');

  // Station modal / form state
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationActionError, setStationActionError] = useState<string | null>(null);

  // New Station form fields
  const [formName, setFormName] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formType, setFormType] = useState<StationType>('EV');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('Pune');
  const [formLat, setFormLat] = useState('18.5204');
  const [formLng, setFormLng] = useState('73.8567');
  const [formOpening, setFormOpening] = useState('06:00');
  const [formClosing, setFormClosing] = useState('23:00');
  const [formIs24x7, setFormIs24x7] = useState(false);
  const [formOpenDays, setFormOpenDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [formStatus, setFormStatus] = useState<OperationalStatus>('OPERATIONAL');
  const [formPhone, setFormPhone] = useState('+91 20 2500 0000');
  const [formEvPrice, setFormEvPrice] = useState('18.0');
  const [formCngPrice, setFormCngPrice] = useState('86.5');

  const auditLogs = getAuditLogs();

  // Metrics calculation
  const totalStations = stations.length;
  const evStations = stations.filter((s) => s.type === 'EV').length;
  const cngStations = stations.filter((s) => s.type === 'CNG').length;
  const hybridStations = stations.filter((s) => s.type === 'HYBRID').length;

  const totalBookings = bookings.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.bookingDate === todayStr).length;
  const completedBookings = bookings.filter((b) => b.bookingStatus === 'COMPLETED').length;
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;

  // Filtered Bookings for Table
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const m =
          b.bookingReference.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q) ||
          b.stationName.toLowerCase().includes(q);
        if (!m) return false;
      }
      if (bookingStatusFilter !== 'ALL' && b.bookingStatus !== bookingStatusFilter) {
        return false;
      }
      if (bookingTypeFilter !== 'ALL' && b.serviceType !== bookingTypeFilter) {
        return false;
      }
      return true;
    });
  }, [bookings, bookingSearch, bookingStatusFilter, bookingTypeFilter]);

  // Export Bookings CSV
  const handleExportCSV = () => {
    const headers = [
      'Booking Reference',
      'Date',
      'Time Slot',
      'Station Name',
      'Bay',
      'Service Type',
      'Vehicle Number',
      'Driver Name',
      'Phone',
      'Amount (INR)',
      'Status',
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingReference}"`,
      `"${b.bookingDate}"`,
      `"${b.timeSlot}"`,
      `"${b.stationName}"`,
      `"${b.bayName}"`,
      `"${b.serviceType}"`,
      `"${b.vehicleNumber}"`,
      `"${b.userName}"`,
      `"${b.userPhone}"`,
      b.estimatedAmount,
      `"${b.bookingStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chargego_bookings_export_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Station Form Submission (Add or Update)
  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      setStationActionError('Please fill station name and address');
      return;
    }

    const lat = parseFloat(formLat) || 18.5204;
    const lng = parseFloat(formLng) || 73.8567;
    const evPrice = parseFloat(formEvPrice) || 18.0;
    const cngPrice = parseFloat(formCngPrice) || 86.5;

    // Generate standard bays based on type
    const newBays = [];
    if (formType === 'EV' || formType === 'HYBRID') {
      newBays.push({
        id: `bay-${Date.now()}-ev1`,
        bayNumber: 'EV Bay 01',
        serviceType: 'EV' as const,
        connectorType: 'CCS-2' as const,
        powerKw: 60,
        pricePerUnit: evPrice,
        unit: 'kWh' as const,
        status: 'AVAILABLE' as const,
        slotDurationMinutes: 45,
      });
      newBays.push({
        id: `bay-${Date.now()}-ev2`,
        bayNumber: 'EV Bay 02',
        serviceType: 'EV' as const,
        connectorType: 'Type-2 AC' as const,
        powerKw: 22,
        pricePerUnit: evPrice * 0.7,
        unit: 'kWh' as const,
        status: 'AVAILABLE' as const,
        slotDurationMinutes: 60,
      });
    }

    if (formType === 'CNG' || formType === 'HYBRID') {
      newBays.push({
        id: `bay-${Date.now()}-cng1`,
        bayNumber: 'CNG Dispenser 01',
        serviceType: 'CNG' as const,
        connectorType: 'Fast-Fill CNG' as const,
        pressureBar: 210,
        pricePerUnit: cngPrice,
        unit: 'kg' as const,
        status: 'AVAILABLE' as const,
        slotDurationMinutes: 15,
      });
    }

    const stationPayload: Station = {
      id: editingStation ? editingStation.id : `st-${Date.now()}`,
      name: formName.trim(),
      operator: formOperator.trim() || 'Independent Mobility Station',
      type: formType,
      address: formAddress.trim(),
      city: formCity.trim(),
      state: 'Maharashtra',
      latitude: lat,
      longitude: lng,
      openingTime: formIs24x7 ? '00:00' : formOpening,
      closingTime: formIs24x7 ? '23:59' : formClosing,
      is24x7: formIs24x7,
      operationalStatus: formStatus,
      imageUrl:
        formType === 'EV'
          ? '/src/assets/images/ev_rapid_charger_1791912523266.jpg'
          : formType === 'CNG'
          ? '/src/assets/images/cng_refueling_bay_1791912522669.jpg'
          : '/src/assets/images/hero_ev_cng_hub_1791912523070.jpg',
      rating: editingStation ? editingStation.rating : 4.8,
      reviewsCount: editingStation ? editingStation.reviewsCount : 1,
      contactPhone: formPhone.trim(),
      amenities: ['24/7 Security', 'Tire Air', 'Clean Washroom', 'Digital Flow Billing'],
      dataSource: 'ADMIN_MANAGED',
      lastUpdated: new Date().toISOString(),
      bays: editingStation ? editingStation.bays : newBays,
      openDays: formOpenDays && formOpenDays.length > 0 ? formOpenDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    };

    if (editingStation) {
      adminUpdateStation(stationPayload, adminEmail);
    } else {
      adminAddStation(stationPayload, adminEmail);
    }

    onRefreshData();
    setShowAddStationModal(false);
    setEditingStation(null);
    setStationActionError(null);
  };

  const handleDeleteStation = (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station? Active reservations will be protected.')) return;
    const res = adminDeleteStation(stationId, adminEmail);
    if (!res.success) {
      alert(res.error);
    } else {
      onRefreshData();
    }
  };

  const handleOpenEdit = (station: Station) => {
    setEditingStation(station);
    setFormName(station.name);
    setFormOperator(station.operator);
    setFormType(station.type);
    setFormAddress(station.address);
    setFormCity(station.city);
    setFormLat(station.latitude.toString());
    setFormLng(station.longitude.toString());
    setFormOpening(station.openingTime);
    setFormClosing(station.closingTime);
    setFormIs24x7(station.is24x7);
    setFormOpenDays(station.openDays && station.openDays.length > 0 ? station.openDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormStatus(station.operationalStatus);
    setFormPhone(station.contactPhone);
    setShowAddStationModal(true);
  };

  const handleOpenAdd = () => {
    setEditingStation(null);
    setFormName('');
    setFormOperator('Tata Power / MNGL');
    setFormType('HYBRID');
    setFormAddress('');
    setFormCity('Pune');
    setFormLat('18.5204');
    setFormLng('73.8567');
    setFormOpening('06:00');
    setFormClosing('23:00');
    setFormIs24x7(false);
    setFormOpenDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    setFormStatus('OPERATIONAL');
    setFormPhone('+91 20 2500 0000');
    setFormEvPrice('18.5');
    setFormCngPrice('86.8');
    setShowAddStationModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-[#101A2C] bg-subtle-grid-dark text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              RESTRICTED CONSOLE
            </span>
            <span className="text-xs text-slate-400 font-mono">Logged in as {adminEmail}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5 text-white">ChargeGo Central Administration</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5 font-normal">
            Real-time grid management, station capacity configuration, and slot booking audit control
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-bold text-[#101A2C] bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-md hover-lift-subtle press-effect cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Station Hub</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 text-xs font-bold text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl transition-all duration-200 flex items-center gap-1.5 press-effect cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl max-w-fit border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'OVERVIEW' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Network Overview
        </button>
        <button
          onClick={() => setActiveTab('STATIONS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'STATIONS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage Stations ({totalStations})
        </button>
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'BOOKINGS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage Bookings ({totalBookings})
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer press-effect ${
            activeTab === 'AUDIT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stations</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">{totalStations}</div>
              <div className="text-[11px] text-slate-500 mt-1">
                {evStations} EV · {cngStations} CNG · {hybridStations} Hybrid
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reservations</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-1 tabular-nums">{totalBookings}</div>
              <div className="text-[11px] text-emerald-800 mt-1">{todayBookings} slots booked for today</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fulfilled Sessions</div>
              <div className="text-3xl font-extrabold text-sky-700 mt-1 tabular-nums">{completedBookings}</div>
              <div className="text-[11px] text-slate-500 mt-1">Dispensed successfully</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cancelled & Released</div>
              <div className="text-3xl font-extrabold text-slate-600 mt-1 tabular-nums">{cancelledBookings}</div>
              <div className="text-[11px] text-slate-500 mt-1">Capacity freed in real time</div>
            </div>
          </div>

          {/* Clean Interactive SVG Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 7-Day Booking Trends */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">7-Day Slot Demand Trend</h3>
                  <p className="text-xs text-slate-500">Daily reservation distribution between EV and CNG services</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-sm bg-emerald-600"></span>
                    <span>EV Chargers</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-3 h-3 rounded-sm bg-sky-600"></span>
                    <span>CNG Dispensers</span>
                  </span>
                </div>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="pt-4">
                <svg className="w-full h-48" viewBox="0 0 700 180">
                  {/* Grid lines */}
                  <line x1="50" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="60" x2="680" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="100" x2="680" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="50" y1="140" x2="680" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Y Axis labels */}
                  <text x="35" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">30</text>
                  <text x="35" y="64" fontSize="10" fill="#94a3b8" textAnchor="end">20</text>
                  <text x="35" y="104" fontSize="10" fill="#94a3b8" textAnchor="end">10</text>
                  <text x="35" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                  {/* 7 Days of data */}
                  {[
                    { day: 'Wed', ev: 18, cng: 14, x: 90 },
                    { day: 'Thu', ev: 22, cng: 16, x: 175 },
                    { day: 'Fri', ev: 25, cng: 20, x: 260 },
                    { day: 'Sat', ev: 28, cng: 24, x: 345 },
                    { day: 'Sun', ev: 26, cng: 22, x: 430 },
                    { day: 'Mon', ev: 20, cng: 15, x: 515 },
                    { day: 'Today', ev: 24, cng: 19, x: 600 },
                  ].map((bar, idx) => {
                    const evHeight = (bar.ev / 30) * 120;
                    const cngHeight = (bar.cng / 30) * 120;

                    return (
                      <g key={idx}>
                        {/* EV Bar */}
                        <rect
                          x={bar.x - 18}
                          y={140 - evHeight}
                          width="16"
                          height={evHeight}
                          fill="#059669"
                          rx="3"
                        />
                        {/* CNG Bar */}
                        <rect
                          x={bar.x + 2}
                          y={140 - cngHeight}
                          width="16"
                          height={cngHeight}
                          fill="#0284c7"
                          rx="3"
                        />
                        {/* Day Label */}
                        <text
                          x={bar.x}
                          y="160"
                          fontSize="11"
                          fill="#475569"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {bar.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Fuel Ratio & Network Health */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Network Infrastructure Mix</h3>
              <p className="text-xs text-slate-500">Distribution across zero-emission and clean-fuel hubs</p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">EV Fast Charging</span>
                    <span className="text-slate-700 font-bold tabular-nums">58%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-sky-700">CNG Refuelling</span>
                    <span className="text-slate-700 font-bold tabular-nums">42%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 mt-4">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Real-Time Concurrency State</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  All 8 network stations are operating with atomic capacity locking. Overbooking is prevented at the storage level.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE STATIONS */}
      {activeTab === 'STATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-900 text-base">Configured Station Fleet</h3>
            <button
              onClick={handleOpenAdd}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Station</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Station Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Address & City</th>
                  <th className="p-3">Bays</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stations.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.operator}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {s.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 max-w-xs truncate">{s.address}</div>
                      <div className="text-[11px] text-slate-500">{s.city}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700 tabular-nums">{s.bays.length} Bays</td>
                    <td className="p-3">{s.is24x7 ? '24 Hours' : `${s.openingTime}-${s.closingTime}`}</td>
                    <td className="p-3">
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {formatOpenDays(s.openDays)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.operationalStatus === 'OPERATIONAL'
                            ? 'bg-emerald-50 text-emerald-800'
                            : s.operationalStatus === 'BUSY'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-rose-50 text-rose-800'
                        }`}
                      >
                        {s.operationalStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                        title="Edit station"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStation(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete station"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE BOOKINGS */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search reference, vehicle, driver..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={bookingTypeFilter}
                onChange={(e) => setBookingTypeFilter(e.target.value)}
                className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="ALL">All Services</option>
                <option value="EV">EV Charging</option>
                <option value="CNG">CNG Refuelling</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Filtered ({filteredBookings.length})</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Station & Bay</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Vehicle / Driver</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No bookings matching search.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{b.stationName}</div>
                        <div className="text-[11px] text-slate-500">{b.bayName}</div>
                      </td>
                      <td className="p-3">
                        <div className="tabular-nums font-medium text-slate-800">{b.bookingDate}</div>
                        <div className="text-[11px] text-emerald-700 font-bold tabular-nums">{b.timeSlot}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-800">{b.vehicleNumber}</div>
                        <div className="text-[11px] text-slate-500">
                          {b.userName} ({b.userPhone})
                        </div>
                      </td>
                      <td className="p-3 font-bold text-slate-900 tabular-nums">₹{b.estimatedAmount}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : b.bookingStatus === 'COMPLETED'
                              ? 'bg-sky-50 text-sky-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {b.bookingStatus === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => {
                                updateBookingStatus(b.id, 'COMPLETED', adminEmail);
                                onRefreshData();
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded"
                              title="Mark as completed"
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => {
                                updateBookingStatus(b.id, 'CANCELLED', adminEmail);
                                onRefreshData();
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded"
                              title="Cancel & Release"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">System Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Immutable trace of administrative events, station creation, and cancellations
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              {auditLogs.length} Events Logged
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>{log.adminEmail}</div>
                  <div className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT STATION MODAL */}
      {showAddStationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStation ? 'Edit Station Details' : 'Add New Mobility Station'}
              </h3>
              <button
                onClick={() => setShowAddStationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {stationActionError && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">
                {stationActionError}
              </div>
            )}

            <form onSubmit={handleSaveStation} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Station Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. ChargeGo Superhub Hinjawadi"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Network Operator</label>
                  <input
                    type="text"
                    value={formOperator}
                    onChange={(e) => setFormOperator(e.target.value)}
                    placeholder="e.g. Tata Power / Jio-BP"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Station Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="EV">EV Only</option>
                    <option value="CNG">CNG Only</option>
                    <option value="HYBRID">Hybrid (EV + CNG)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="BUSY">Busy</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Street name, landmark, area"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="18.5204"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="73.8567"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EV Price (₹ / kWh)</label>
                  <input
                    type="text"
                    value={formEvPrice}
                    onChange={(e) => setFormEvPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNG Price (₹ / kg)</label>
                  <input
                    type="text"
                    value={formCngPrice}
                    onChange={(e) => setFormCngPrice(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Operating Days Selector (Mon - Sun, Mon - Sat, custom) */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open Days (Operating Schedule)</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800">
                    {formatOpenDays(formOpenDays)}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setFormOpenDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      formOpenDays.length === 7
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    All Days (Mon – Sun)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpenDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      formOpenDays.length === 6 && !formOpenDays.includes('Sun')
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    Mon – Sat (Sun Closed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpenDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                      formOpenDays.length === 5 && !formOpenDays.includes('Sat') && !formOpenDays.includes('Sun')
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    Mon – Fri (Weekdays)
                  </button>
                </div>

                {/* Day of Week Badges */}
                <div className="grid grid-cols-7 gap-1 pt-1">
                  {ALL_DAYS.map((day) => {
                    const isChecked = formOpenDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (formOpenDays.length > 1) {
                              setFormOpenDays(formOpenDays.filter((d) => d !== day));
                            }
                          } else {
                            setFormOpenDays([...formOpenDays, day]);
                          }
                        }}
                        className={`py-1.5 text-center text-xs font-bold rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is247"
                  checked={formIs24x7}
                  onChange={(e) => setFormIs24x7(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="is247" className="font-medium text-slate-700">
                  Open 24 Hours
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStationModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
