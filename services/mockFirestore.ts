// Mock Firestore service for development
import { Lock, Schedule, Trip, Remark, Analytics } from '@/types';

// Mock data storage
let mockLocks: Lock[] = [
  {
    id: 'lock-001',
    lockNumber: 'L001',
    status: 'available',
    lastUpdated: new Date(),
  },
  {
    id: 'lock-002',
    lockNumber: 'L002',
    status: 'in_transit',
    assignedTo: 'tracking-001',
    lastUpdated: new Date(),
  },
  {
    id: 'lock-003',
    lockNumber: 'L003',
    status: 'on_reverse_transit',
    assignedTo: 'tracking-001',
    lastUpdated: new Date(),
  },
];

let mockSchedules: Schedule[] = [
  {
    id: 'schedule-001',
    date: '2024-12-20',
    note: 'Regular inspection route',
    createdBy: 'admin-001',
    createdAt: new Date(),
  },
  {
    id: 'schedule-002',
    date: '2024-12-21',
    note: 'Emergency response',
    createdBy: 'admin-001',
    createdAt: new Date(),
  },
];

let mockRemarks: Remark[] = [
  {
    id: 'remark-001',
    lockId: 'lock-001',
    userId: 'admin-001',
    userName: 'Admin User',
    message: 'Lock inspected and ready for deployment',
    timestamp: new Date(),
  },
  {
    id: 'remark-002',
    lockId: 'lock-002',
    userId: 'tracking-001',
    userName: 'Tracking Team',
    message: 'Started transit to destination',
    timestamp: new Date(),
  },
];

let mockTrips: Trip[] = [
  {
    id: 'trip-001',
    lockId: 'lock-002',
    scheduleId: 'schedule-001',
    startTime: new Date(),
    status: 'active',
    distanceKm: 25.5,
    detentionMins: 30,
  },
];

// Utility function to simulate async operations
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Lock operations
export const addLock = async (lockData: Omit<Lock, 'id'>): Promise<string> => {
  await delay();
  const newLock: Lock = {
    ...lockData,
    id: `lock-${Date.now()}`,
    lastUpdated: new Date(),
  };
  mockLocks.push(newLock);
  return newLock.id;
};

export const updateLockStatus = async (lockId: string, status: Lock['status']): Promise<void> => {
  await delay();
  const lockIndex = mockLocks.findIndex(lock => lock.id === lockId);
  if (lockIndex !== -1) {
    mockLocks[lockIndex] = {
      ...mockLocks[lockIndex],
      status,
      lastUpdated: new Date(),
    };
  }
};

export const getLocks = async (): Promise<Lock[]> => {
  await delay();
  return [...mockLocks];
};

// Schedule operations
export const addSchedule = async (scheduleData: Omit<Schedule, 'id'>): Promise<string> => {
  await delay();
  const newSchedule: Schedule = {
    ...scheduleData,
    id: `schedule-${Date.now()}`,
    createdAt: new Date(),
  };
  mockSchedules.push(newSchedule);
  return newSchedule.id;
};

export const getSchedules = async (): Promise<Schedule[]> => {
  await delay();
  return [...mockSchedules].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await delay();
  mockSchedules = mockSchedules.filter(schedule => schedule.id !== scheduleId);
};

// Trip operations
export const addTrip = async (tripData: Omit<Trip, 'id'>): Promise<string> => {
  await delay();
  const newTrip: Trip = {
    ...tripData,
    id: `trip-${Date.now()}`,
    startTime: new Date(),
  };
  mockTrips.push(newTrip);
  return newTrip.id;
};

export const updateTrip = async (tripId: string, tripData: Partial<Trip>): Promise<void> => {
  await delay();
  const tripIndex = mockTrips.findIndex(trip => trip.id === tripId);
  if (tripIndex !== -1) {
    mockTrips[tripIndex] = {
      ...mockTrips[tripIndex],
      ...tripData,
    };
  }
};

// Remarks operations
export const addRemark = async (remarkData: Omit<Remark, 'id'>): Promise<string> => {
  await delay();
  const newRemark: Remark = {
    ...remarkData,
    id: `remark-${Date.now()}`,
    timestamp: new Date(),
  };
  mockRemarks.push(newRemark);
  return newRemark.id;
};

export const getRemarksByLock = async (lockId: string): Promise<Remark[]> => {
  await delay();
  return mockRemarks
    .filter(remark => remark.lockId === lockId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Analytics operations
export const getAnalytics = async (): Promise<Analytics[]> => {
  await delay();
  
  return mockLocks.map(lock => {
    const lockTrips = mockTrips.filter(trip => trip.lockId === lock.id);
    return {
      lockId: lock.id,
      lockNumber: lock.lockNumber,
      totalTrips: lockTrips.length,
      totalDistance: lockTrips.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0),
      totalDetentionTime: lockTrips.reduce((sum, trip) => sum + (trip.detentionMins || 0), 0),
    };
  });
};