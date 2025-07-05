// Dummy Firestore service with multi-vendor support
import { Lock, Schedule, Trip, Remark, Analytics } from '@/types';
import { dummyAuthService } from './dummyAuthService';
import { DUMMY_DATA, getVendorData, generateAnalytics, getSystemAnalytics } from './dummyDataService';

// Utility function to simulate async operations
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Get current user's vendor ID
const getCurrentVendorId = (): string => {
  const user = dummyAuthService.getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.vendorId;
};

// Check if current user is system super admin
const isSystemSuperAdmin = (): boolean => {
  const user = dummyAuthService.getCurrentUser();
  return user?.vendorId === 'system' && user?.role === 'superadmin';
};

// Lock operations (vendor-scoped or system-wide for system super admin)
export const addLock = async (lockData: Omit<Lock, 'id'>): Promise<string> => {
  await delay();
  const vendorId = getCurrentVendorId();
  
  // System super admin cannot add locks directly - they manage vendors
  if (vendorId === 'system') {
    throw new Error('System administrators cannot add locks directly. Please use vendor management.');
  }
  
  const vendorData = getVendorData(vendorId);
  
  // Check if lock number already exists for this vendor
  const exists = vendorData.locks.some(lock => lock.lockNumber === lockData.lockNumber);
  if (exists) {
    throw new Error('Lock number already exists for this vendor');
  }
  
  const newLock: Lock = {
    ...lockData,
    id: `${vendorId}-lock-${Date.now()}`,
    vendorId,
    lastUpdated: new Date(),
  };
  
  vendorData.locks.push(newLock);
  return newLock.id;
};

export const updateLockStatus = async (lockId: string, status: Lock['status']): Promise<void> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin can update any lock
  if (isSystemSuperAdmin()) {
    // Find lock across all vendors
    let lockFound = false;
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      const lockIndex = vendorData.locks.findIndex(lock => lock.id === lockId);
      if (lockIndex !== -1) {
        vendorData.locks[lockIndex] = {
          ...vendorData.locks[lockIndex],
          status,
          lastUpdated: new Date(),
        };
        lockFound = true;
      }
    });
    
    if (!lockFound) {
      throw new Error('Lock not found');
    }
    return;
  }
  
  // Regular vendor users
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  
  const lockIndex = vendorData.locks.findIndex(lock => lock.id === lockId);
  if (lockIndex === -1) {
    throw new Error('Lock not found or access denied');
  }
  
  // Check if user can update this lock (tracking users can only update assigned locks)
  const lock = vendorData.locks[lockIndex];
  if (user.role === 'tracking' && lock.assignedTo !== user.id) {
    throw new Error('You can only update locks assigned to you');
  }
  
  vendorData.locks[lockIndex] = {
    ...vendorData.locks[lockIndex],
    status,
    lastUpdated: new Date(),
  };
};

export const getLocks = async (): Promise<Lock[]> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin gets all locks from all vendors
  if (isSystemSuperAdmin()) {
    let allLocks: Lock[] = [];
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      allLocks = [...allLocks, ...vendorData.locks];
    });
    return allLocks;
  }
  
  // Regular vendor users get their vendor's locks
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  
  // Tracking users only see their assigned locks
  if (user.role === 'tracking') {
    return vendorData.locks.filter(lock => lock.assignedTo === user.id);
  }
  
  return [...vendorData.locks];
};

// Schedule operations (vendor-scoped or system-wide for system super admin)
export const addSchedule = async (scheduleData: Omit<Schedule, 'id'>): Promise<string> => {
  await delay();
  const vendorId = getCurrentVendorId();
  
  // System super admin cannot add schedules directly
  if (vendorId === 'system') {
    throw new Error('System administrators cannot add schedules directly. Please use vendor management.');
  }
  
  const vendorData = getVendorData(vendorId);
  
  const newSchedule: Schedule = {
    ...scheduleData,
    id: `${vendorId}-schedule-${Date.now()}`,
    vendorId,
    createdAt: new Date(),
  };
  
  vendorData.schedules.push(newSchedule);
  return newSchedule.id;
};

export const getSchedules = async (): Promise<Schedule[]> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin gets all schedules from all vendors
  if (isSystemSuperAdmin()) {
    let allSchedules: Schedule[] = [];
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      allSchedules = [...allSchedules, ...vendorData.schedules];
    });
    return allSchedules.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  // Regular vendor users get their vendor's schedules
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  return [...vendorData.schedules].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin can delete any schedule
  if (isSystemSuperAdmin()) {
    let scheduleFound = false;
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      const scheduleIndex = vendorData.schedules.findIndex(schedule => schedule.id === scheduleId);
      if (scheduleIndex !== -1) {
        vendorData.schedules.splice(scheduleIndex, 1);
        scheduleFound = true;
      }
    });
    
    if (!scheduleFound) {
      throw new Error('Schedule not found');
    }
    return;
  }
  
  // Regular vendor users
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  
  const scheduleIndex = vendorData.schedules.findIndex(schedule => schedule.id === scheduleId);
  if (scheduleIndex === -1) {
    throw new Error('Schedule not found or access denied');
  }
  
  vendorData.schedules.splice(scheduleIndex, 1);
};

// Trip operations (vendor-scoped)
export const addTrip = async (tripData: Omit<Trip, 'id'>): Promise<string> => {
  await delay();
  const vendorId = getCurrentVendorId();
  
  if (vendorId === 'system') {
    throw new Error('System administrators cannot add trips directly.');
  }
  
  const vendorData = getVendorData(vendorId);
  
  const newTrip: Trip = {
    ...tripData,
    id: `${vendorId}-trip-${Date.now()}`,
    vendorId,
    startTime: new Date(),
  };
  
  vendorData.trips.push(newTrip);
  return newTrip.id;
};

export const updateTrip = async (tripId: string, tripData: Partial<Trip>): Promise<void> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin can update any trip
  if (isSystemSuperAdmin()) {
    let tripFound = false;
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      const tripIndex = vendorData.trips.findIndex(trip => trip.id === tripId);
      if (tripIndex !== -1) {
        vendorData.trips[tripIndex] = {
          ...vendorData.trips[tripIndex],
          ...tripData,
        };
        tripFound = true;
      }
    });
    
    if (!tripFound) {
      throw new Error('Trip not found');
    }
    return;
  }
  
  // Regular vendor users
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  
  const tripIndex = vendorData.trips.findIndex(trip => trip.id === tripId);
  if (tripIndex === -1) {
    throw new Error('Trip not found or access denied');
  }
  
  vendorData.trips[tripIndex] = {
    ...vendorData.trips[tripIndex],
    ...tripData,
  };
};

// Remarks operations (vendor-scoped or system-wide for system super admin)
export const addRemark = async (remarkData: Omit<Remark, 'id'>): Promise<string> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const vendorId = getCurrentVendorId();
  
  if (vendorId === 'system') {
    throw new Error('System administrators cannot add remarks directly.');
  }
  
  const vendorData = getVendorData(vendorId);
  
  const newRemark: Remark = {
    ...remarkData,
    id: `${vendorId}-remark-${Date.now()}`,
    vendorId,
    timestamp: new Date(),
  };
  
  vendorData.remarks.push(newRemark);
  return newRemark.id;
};

export const getRemarksByLock = async (lockId: string): Promise<Remark[]> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin gets remarks from all vendors
  if (isSystemSuperAdmin()) {
    let allRemarks: Remark[] = [];
    Object.keys(DUMMY_DATA).forEach(vendorId => {
      const vendorData = getVendorData(vendorId);
      const lockRemarks = vendorData.remarks.filter(remark => remark.lockId === lockId);
      allRemarks = [...allRemarks, ...lockRemarks];
    });
    return allRemarks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Regular vendor users
  const vendorId = getCurrentVendorId();
  const vendorData = getVendorData(vendorId);
  
  return vendorData.remarks
    .filter(remark => remark.lockId === lockId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Analytics operations (vendor-scoped or system-wide for system super admin)
export const getAnalytics = async (): Promise<Analytics[]> => {
  await delay();
  const user = dummyAuthService.getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  // System super admin gets analytics from all vendors
  if (isSystemSuperAdmin()) {
    return getSystemAnalytics();
  }
  
  // Regular vendor users get their vendor's analytics
  const vendorId = getCurrentVendorId();
  return generateAnalytics(vendorId);
};