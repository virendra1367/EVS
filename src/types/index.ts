export type StationType = 'EV' | 'CNG' | 'HYBRID';

export type OperationalStatus = 'OPERATIONAL' | 'BUSY' | 'MAINTENANCE' | 'CLOSED';

export type ConnectorType = 
  | 'CCS-2' 
  | 'Type-2 AC' 
  | 'CHAdeMO' 
  | 'GB/T' 
  | 'Fast-Fill CNG' 
  | 'Standard CNG (200 bar)';

export interface ServiceBay {
  id: string;
  bayNumber: string;
  serviceType: 'EV' | 'CNG';
  connectorType: ConnectorType;
  powerKw?: number; // for EV
  pressureBar?: number; // for CNG
  pricePerUnit: number; // ₹ per kWh or ₹ per kg
  unit: 'kWh' | 'kg';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  slotDurationMinutes: number; // e.g. 30 or 45 mins
}

export interface Station {
  id: string;
  name: string;
  operator: string;
  type: StationType;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  openingTime: string; // e.g. "06:00"
  closingTime: string; // e.g. "23:00" or "24 Hours"
  is24x7: boolean;
  operationalStatus: OperationalStatus;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  contactPhone: string;
  amenities: string[];
  bays: ServiceBay[];
  openDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  dataSource: 'VERIFIED_PARTNER' | 'ADMIN_MANAGED' | 'COMMUNITY_REPORT';
  lastUpdated: string;
}

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. "CG-2026-EV-8492"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  stationType: StationType;
  bayId: string;
  bayName: string;
  serviceType: 'EV' | 'CNG';
  connectorType: ConnectorType;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 09:45"
  vehicleModel: string;
  vehicleNumber: string;
  estimatedAmount: number;
  paymentMode: 'PAY_AT_STATION' | 'UPI_QR_AT_PUMP';
  paymentStatus: 'PENDING_AT_STATION' | 'PAID';
  bookingStatus: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
}

export interface UserVehicle {
  id: string;
  model: string;
  registrationNumber: string;
  fuelType: 'EV' | 'CNG';
  batteryOrTankSize: string; // e.g. "40.5 kWh" or "12 kg (60L water equiv)"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'guest' | 'user' | 'admin';
  preferredVehicleType: 'EV' | 'CNG' | 'BOTH';
  vehicles: UserVehicle[];
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  bookingRef?: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  action: string;
  entityType: 'STATION' | 'BOOKING' | 'USER' | 'SYSTEM';
  entityId: string;
  timestamp: string;
  details: string;
}

export interface AuthAccount {
  loginId: string;
  password: string;
  profile: UserProfile;
}

