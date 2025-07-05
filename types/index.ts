export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'tracking';
  vendorId: string;
  vendorName: string;
  createdAt: Date;
  isActive?: boolean;
  phone?: string;
  department?: string;
}

export interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Lock {
  id: string;
  status: 'available' | 'in_transit' | 'on_reverse_transit' | 'reached';
  assignedTo?: string;
  currentTripId?: string;
  lastUpdated: Date;
  lockNumber: string;
  vendorId: string;
}

export interface Schedule {
  id: string;
  date: string;
  note?: string;
  createdBy: string;
  vendorId: string;
  createdAt: Date;
}

export interface Trip {
  id: string;
  lockId: string;
  scheduleId: string;
  vendorId: string;
  startTime: Date;
  endTime?: Date;
  distanceKm?: number;
  detentionMins?: number;
  status: 'active' | 'completed';
}

export interface Remark {
  id: string;
  lockId: string;
  userId: string;
  userName: string;
  message: string;
  vendorId: string;
  timestamp: Date;
}

export interface Analytics {
  lockId: string;
  lockNumber: string;
  totalTrips: number;
  totalDistance: number;
  totalDetentionTime: number;
}