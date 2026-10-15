import { Station, Booking, UserProfile, InAppNotification, AdminAuditLog, AuthAccount } from '../types';
import { SEED_STATIONS } from '../data/seedStations';

const STATIONS_KEY = 'chargego_stations_v1';
const BOOKINGS_KEY = 'chargego_bookings_v1';
const USER_KEY = 'chargego_current_user_v1';
const NOTIFICATIONS_KEY = 'chargego_notifications_v1';
const AUDIT_LOGS_KEY = 'chargego_audit_logs_v1';
const FAVOURITES_KEY = 'chargego_favourites_v1';
const AUTH_ACCOUNTS_KEY = 'chargego_auth_accounts_v2';

// Seed demo user
export const DEMO_USER: UserProfile = {
  id: 'usr-101',
  name: 'Rahul Patil',
  email: 'rahul.patil@chargego.org',
  phone: '+91 98230 44123',
  role: 'user',
  preferredVehicleType: 'BOTH',
  createdAt: '2026-08-15',
  vehicles: [
    {
      id: 'veh-01',
      model: 'Tata Nexon.ev Empowered+ (40.5 kWh)',
      registrationNumber: 'MH 12 TE 8840',
      fuelType: 'EV',
      batteryOrTankSize: '40.5 kWh',
    },
    {
      id: 'veh-02',
      model: 'Maruti Suzuki WagonR S-CNG',
      registrationNumber: 'MH 14 CN 2199',
      fuelType: 'CNG',
      batteryOrTankSize: '60L (10 kg CNG)',
    },
  ],
};

export const DEMO_ADMIN: UserProfile = {
  id: 'adm-001',
  name: 'Priya Sharma (Fleet & Grid Admin)',
  email: 'admin@chargego.org',
  phone: '+91 94220 55100',
  role: 'admin',
  preferredVehicleType: 'BOTH',
  createdAt: '2026-01-10',
  vehicles: [],
};

// Seed sample initial bookings
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-101',
    bookingReference: 'CG-2026-EV-8492',
    userId: 'usr-101',
    userName: 'Rahul Patil',
    userEmail: 'rahul.patil@chargego.org',
    userPhone: '+91 98230 44123',
    stationId: 'st-01',
    stationName: 'ChargeGo EcoHub – Shivajinagar Central',
    stationAddress: 'Old Mumbai-Pune Highway, Shivajinagar',
    stationType: 'HYBRID',
    bayId: 'bay-01-ev1',
    bayName: 'EV Bay 01 (60kW CCS-2)',
    serviceType: 'EV',
    connectorType: 'CCS-2',
    bookingDate: new Date().toISOString().split('T')[0], // today
    timeSlot: '14:00 - 14:45',
    vehicleModel: 'Tata Nexon.ev Empowered+',
    vehicleNumber: 'MH 12 TE 8840',
    estimatedAmount: 462.5,
    paymentMode: 'PAY_AT_STATION',
    paymentStatus: 'PENDING_AT_STATION',
    bookingStatus: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'bkg-102',
    bookingReference: 'CG-2026-CNG-3310',
    userId: 'usr-101',
    userName: 'Rahul Patil',
    userEmail: 'rahul.patil@chargego.org',
    userPhone: '+91 98230 44123',
    stationId: 'st-03',
    stationName: 'MNGL Clean Energy Station – Kothrud Depot',
    stationAddress: 'Paud Road, Kothrud',
    stationType: 'CNG',
    bayId: 'bay-03-cng1',
    bayName: 'Cascade Dispenser 01 (Fast-Fill)',
    serviceType: 'CNG',
    connectorType: 'Fast-Fill CNG',
    bookingDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '10:00 - 10:15',
    vehicleModel: 'Maruti Suzuki WagonR S-CNG',
    vehicleNumber: 'MH 14 CN 2199',
    estimatedAmount: 520.8,
    paymentMode: 'PAY_AT_STATION',
    paymentStatus: 'PAID',
    bookingStatus: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Seed sample notifications
const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-101',
    title: 'Slot Reserved Successfully',
    message: 'Your slot at ChargeGo EcoHub (Shivajinagar) is confirmed for today at 14:00.',
    date: 'Just now',
    read: false,
    bookingRef: 'CG-2026-EV-8492',
  },
  {
    id: 'notif-2',
    userId: 'usr-101',
    title: 'Green Mobility Point Credited',
    message: 'You saved approximately 4.8 kg CO₂ on your last CNG refill in Kothrud!',
    date: '2 days ago',
    read: true,
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@chargego.org',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'SYSTEM',
    entityId: 'sys-core',
    timestamp: new Date().toISOString(),
    details: 'ChargeGo mobility network initialized with 8 verified EV & CNG stations.',
  },
];

export function getStations(): Station[] {
  try {
    const raw = localStorage.getItem(STATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STATIONS_KEY, JSON.stringify(SEED_STATIONS));
      return SEED_STATIONS;
    }
    const parsed: Station[] = JSON.parse(raw);
    return parsed.map((s) => ({
      ...s,
      openDays: s.openDays && s.openDays.length > 0 ? s.openDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    }));
  } catch {
    return SEED_STATIONS;
  }
}

export function saveStations(stations: Station[]): void {
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
}

export function getBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings: Booking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      localStorage.setItem(USER_KEY, JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_USER;
  }
}

export function setCurrentUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    return raw ? JSON.parse(raw) : ['st-01', 'st-02'];
  } catch {
    return ['st-01'];
  }
}

export function toggleFavourite(stationId: string): string[] {
  const favs = getFavourites();
  const exists = favs.includes(stationId);
  const updated = exists ? favs.filter((id) => id !== stationId) : [...favs, stationId];
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
  return updated;
}

export function getNotifications(userId: string): InAppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    return all.filter((n) => n.userId === userId);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function addNotification(notification: Omit<InAppNotification, 'id'>): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const newNotif: InAppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newNotif, ...all]));
  } catch (err) {
    console.error('Error saving notification', err);
  }
}

export function markNotificationsAsRead(userId: string): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const all: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error marking notifications', err);
  }
}

export function getAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOGS;
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function logAdminAction(
  adminEmail: string,
  action: string,
  entityType: 'STATION' | 'BOOKING' | 'USER' | 'SYSTEM',
  entityId: string,
  details: string
): void {
  const currentLogs = getAuditLogs();
  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}`,
    adminEmail,
    action,
    entityType,
    entityId,
    timestamp: new Date().toISOString(),
    details,
  };
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([newLog, ...currentLogs]));
}

/**
 * Concurrency Safety Check:
 * Checks whether a given station bay is already booked for the target date and time slot.
 */
export function isSlotBooked(stationId: string, bayId: string, date: string, timeSlot: string): boolean {
  const bookings = getBookings();
  return bookings.some(
    (b) =>
      b.stationId === stationId &&
      b.bayId === bayId &&
      b.bookingDate === date &&
      b.timeSlot === timeSlot &&
      b.bookingStatus === 'CONFIRMED'
  );
}

/**
 * Atomic reservation creation with double-booking prevention
 */
export function createBooking(data: {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  station: Station;
  bay: Station['bays'][0];
  date: string;
  timeSlot: string;
  vehicleModel: string;
  vehicleNumber: string;
  estimatedAmount: number;
  paymentMode: 'PAY_AT_STATION' | 'UPI_QR_AT_PUMP';
}): { success: boolean; booking?: Booking; error?: string } {
  // Concurrency check: Ensure slot is still available
  if (isSlotBooked(data.station.id, data.bay.id, data.date, data.timeSlot)) {
    return {
      success: false,
      error: `Slot "${data.timeSlot}" for ${data.bay.bayNumber} is already reserved by another driver. Please choose another slot.`,
    };
  }

  // Generate unique booking reference e.g. VW-2026-EV-7491
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const prefix = data.bay.serviceType === 'EV' ? 'EV' : 'CNG';
  const bookingReference = `VW-2026-${prefix}-${randCode}`;

  const newBooking: Booking = {
    id: `bkg-${Date.now()}-${randCode}`,
    bookingReference,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone,
    stationId: data.station.id,
    stationName: data.station.name,
    stationAddress: data.station.address,
    stationType: data.station.type,
    bayId: data.bay.id,
    bayName: `${data.bay.bayNumber} (${data.bay.connectorType}${data.bay.powerKw ? ` ${data.bay.powerKw}kW` : ''})`,
    serviceType: data.bay.serviceType,
    connectorType: data.bay.connectorType,
    bookingDate: data.date,
    timeSlot: data.timeSlot,
    vehicleModel: data.vehicleModel,
    vehicleNumber: data.vehicleNumber.toUpperCase().trim(),
    estimatedAmount: data.estimatedAmount,
    paymentMode: data.paymentMode,
    paymentStatus: 'PENDING_AT_STATION',
    bookingStatus: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  };

  const allBookings = getBookings();
  saveBookings([newBooking, ...allBookings]);

  // Send in-app notification
  addNotification({
    userId: data.userId,
    title: 'Slot Confirmed!',
    message: `Your reservation at ${data.station.name} (${data.timeSlot}) is confirmed. Ref: ${bookingReference}`,
    date: 'Just now',
    read: false,
    bookingRef: bookingReference,
  });

  return { success: true, booking: newBooking };
}

/**
 * Cancel a booking and immediately release the slot capacity
 */
export function cancelBooking(bookingId: string, cancelledByUserId: string, reason = 'Cancelled by user'): boolean {
  const allBookings = getBookings();
  const index = allBookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return false;

  const target = allBookings[index];
  if (target.bookingStatus !== 'CONFIRMED') {
    return false; // Can only cancel confirmed active bookings
  }

  const updated: Booking = {
    ...target,
    bookingStatus: 'CANCELLED',
    cancelledAt: new Date().toISOString(),
  };

  allBookings[index] = updated;
  saveBookings(allBookings);

  // Notify user
  addNotification({
    userId: target.userId,
    title: 'Booking Cancelled',
    message: `Reservation ${target.bookingReference} for ${target.timeSlot} was cancelled. Bay capacity has been released.`,
    date: 'Just now',
    read: false,
  });

  // Log admin audit
  logAdminAction(
    cancelledByUserId,
    'BOOKING_CANCELLED',
    'BOOKING',
    target.id,
    `Booking ${target.bookingReference} cancelled. Reason: ${reason}`
  );

  return true;
}

/**
 * Admin action to mark booking as completed or no-show
 */
export function updateBookingStatus(
  bookingId: string,
  newStatus: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED',
  adminEmail: string
): boolean {
  const allBookings = getBookings();
  const index = allBookings.findIndex((b) => b.id === bookingId);
  if (index === -1) return false;

  const target = allBookings[index];
  allBookings[index] = {
    ...target,
    bookingStatus: newStatus,
    paymentStatus: newStatus === 'COMPLETED' ? 'PAID' : target.paymentStatus,
  };

  saveBookings(allBookings);
  logAdminAction(
    adminEmail,
    `BOOKING_${newStatus}`,
    'BOOKING',
    target.id,
    `Admin updated status to ${newStatus} for ${target.bookingReference}`
  );

  return true;
}

/**
 * Admin station management operations
 */
export function adminAddStation(station: Station, adminEmail: string): void {
  const stations = getStations();
  const updated = [station, ...stations];
  saveStations(updated);
  logAdminAction(adminEmail, 'STATION_CREATED', 'STATION', station.id, `Created station: ${station.name}`);
}

export function adminUpdateStation(station: Station, adminEmail: string): void {
  const stations = getStations();
  const updated = stations.map((s) => (s.id === station.id ? station : s));
  saveStations(updated);
  logAdminAction(adminEmail, 'STATION_UPDATED', 'STATION', station.id, `Updated details for ${station.name}`);
}

export function adminDeleteStation(stationId: string, adminEmail: string): { success: boolean; error?: string } {
  const bookings = getBookings();
  const hasActiveBookings = bookings.some((b) => b.stationId === stationId && b.bookingStatus === 'CONFIRMED');

  if (hasActiveBookings) {
    return {
      success: false,
      error: 'Cannot delete station: There are currently confirmed upcoming bookings at this station.',
    };
  }

  const stations = getStations();
  const target = stations.find((s) => s.id === stationId);
  const updated = stations.filter((s) => s.id !== stationId);
  saveStations(updated);

  logAdminAction(
    adminEmail,
    'STATION_DELETED',
    'STATION',
    stationId,
    `Deleted station: ${target?.name || stationId}`
  );

  return { success: true };
}

/**
 * Generate standard time slots for a day
 */
export function generateTimeSlots(startHour = 6, endHour = 23, durationMinutes = 45): string[] {
  const slots: string[] = [];
  let currentMinute = startHour * 60;
  const endMinute = endHour * 60;

  while (currentMinute + durationMinutes <= endMinute) {
    const startH = Math.floor(currentMinute / 60);
    const startM = currentMinute % 60;
    const endSlotMinute = currentMinute + durationMinutes;
    const endH = Math.floor(endSlotMinute / 60);
    const endM = endSlotMinute % 60;

    const startStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    slots.push(`${startStr} - ${endStr}`);
    currentMinute += durationMinutes;
  }

  return slots;
}

// Pre-seeded verified accounts for ChargeGo
export const INITIAL_AUTH_ACCOUNTS: AuthAccount[] = [
  {
    loginId: 'rahul_patil',
    password: 'ChargeGo@2026',
    profile: DEMO_USER,
  },
  {
    loginId: 'admin_priya',
    password: 'Admin#ChargeGo2026',
    profile: DEMO_ADMIN,
  },
  {
    loginId: 'driver_rahul',
    password: 'Password@123',
    profile: DEMO_USER,
  },
];

export function getAuthAccounts(): AuthAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(INITIAL_AUTH_ACCOUNTS));
      return INITIAL_AUTH_ACCOUNTS;
    }
    const accounts: AuthAccount[] = JSON.parse(raw);
    return accounts;
  } catch {
    return INITIAL_AUTH_ACCOUNTS;
  }
}

export function saveAuthAccounts(accounts: AuthAccount[]): void {
  localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function registerAuthAccount(
  loginId: string,
  password: string,
  profile: UserProfile
): { success: boolean; error?: string; account?: AuthAccount } {
  const cleanId = loginId.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId) {
    return { success: false, error: 'User ID is required.' };
  }
  if (!cleanPass || cleanPass.length < 4) {
    return { success: false, error: 'Password must be at least 4 characters long.' };
  }

  const accounts = getAuthAccounts();
  const existing = accounts.find(
    (a) => a.loginId.toLowerCase() === cleanId || a.profile.email.toLowerCase() === cleanId
  );
  if (existing) {
    return {
      success: false,
      error: `User ID "${cleanId}" is already registered. Please sign in or use another ID.`,
    };
  }

  const newAccount: AuthAccount = {
    loginId: cleanId,
    password: cleanPass,
    profile,
  };

  const updated = [...accounts, newAccount];
  saveAuthAccounts(updated);
  return { success: true, account: newAccount };
}

export function authenticateUser(
  loginId: string,
  passwordAttempt: string
): {
  success: boolean;
  errorType?: 'EMPTY_FIELDS' | 'NOT_FOUND' | 'WRONG_PASSWORD';
  message?: string;
  user?: UserProfile;
  suggestedPasswordHint?: string;
  actualPassword?: string;
} {
  const cleanId = loginId.trim().toLowerCase();
  const cleanPass = passwordAttempt.trim();

  if (!cleanId || !cleanPass) {
    return {
      success: false,
      errorType: 'EMPTY_FIELDS',
      message: 'Please provide both User ID and Password.',
    };
  }

  const accounts = getAuthAccounts();
  const account = accounts.find(
    (a) => a.loginId.toLowerCase() === cleanId || a.profile.email.toLowerCase() === cleanId
  );

  if (!account) {
    return {
      success: false,
      errorType: 'NOT_FOUND',
      message: `User ID "${cleanId}" does not exist in the ChargeGo registry. No unregistered user can sign in. Please create an account first.`,
    };
  }

  if (account.password !== cleanPass) {
    const len = account.password.length;
    const hint =
      len > 3
        ? `${account.password.slice(0, 2)}${'*'.repeat(Math.max(1, len - 3))}${account.password.slice(-1)} (${len} chars)`
        : `${'*'.repeat(len)} (${len} chars)`;

    return {
      success: false,
      errorType: 'WRONG_PASSWORD',
      message: `Wrong password! The password entered for User ID "${account.loginId}" is incorrect.`,
      suggestedPasswordHint: hint,
      actualPassword: account.password,
    };
  }

  return {
    success: true,
    user: account.profile,
  };
}

export function generateSuggestedCredentials(name = 'driver'): {
  suggestedId: string;
  suggestedPassword: string;
} {
  const cleanBase = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10) || 'user';
  const randomNum = Math.floor(100 + Math.random() * 900);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const suggestedId = `${cleanBase}_${randomNum}`;

  const passAdjectives = ['Fast', 'Clean', 'Smart', 'Green', 'Eco', 'Power', 'Hyper', 'Swift'];
  const passNouns = ['Charge', 'Flow', 'Grid', 'Drive', 'Pass', 'Station', 'Speed'];
  const adj = passAdjectives[Math.floor(Math.random() * passAdjectives.length)];
  const noun = passNouns[Math.floor(Math.random() * passNouns.length)];
  const suggestedPassword = `${adj}${noun}@${randomSuffix}`;

  return { suggestedId, suggestedPassword };
}

