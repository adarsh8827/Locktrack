// Dummy data service with multi-vendor support
import { Lock, Schedule, Trip, Remark, Analytics } from '@/types';
import { DEMO_USERS } from './dummyAuthService';

// Vendor-specific dummy data
export const DUMMY_DATA = {
  // ABC Transport Co. (vendorId: '1')
  '1': {
    locks: [
      {
        id: 'abc-lock-001',
        lockNumber: 'ABC-L001',
        status: 'available' as const,
        vendorId: '1',
        lastUpdated: new Date(),
      },
      {
        id: 'abc-lock-002',
        lockNumber: 'ABC-L002',
        status: 'in_transit' as const,
        assignedTo: 'abc-track-001',
        vendorId: '1',
        lastUpdated: new Date(),
      },
      {
        id: 'abc-lock-003',
        lockNumber: 'ABC-L003',
        status: 'on_reverse_transit' as const,
        assignedTo: 'abc-track-002',
        vendorId: '1',
        lastUpdated: new Date(),
      },
      {
        id: 'abc-lock-004',
        lockNumber: 'ABC-L004',
        status: 'reached' as const,
        vendorId: '1',
        lastUpdated: new Date(),
      },
      {
        id: 'abc-lock-005',
        lockNumber: 'ABC-L005',
        status: 'available' as const,
        vendorId: '1',
        lastUpdated: new Date(),
      },
    ] as Lock[],

    schedules: [
      {
        id: 'abc-schedule-001',
        date: '2024-12-20',
        note: 'ABC Transport - Regular delivery route',
        createdBy: 'abc-admin-001',
        vendorId: '1',
        createdAt: new Date(),
      },
      {
        id: 'abc-schedule-002',
        date: '2024-12-21',
        note: 'ABC Transport - Priority shipment',
        createdBy: 'abc-admin-001',
        vendorId: '1',
        createdAt: new Date(),
      },
      {
        id: 'abc-schedule-003',
        date: '2024-12-22',
        note: 'ABC Transport - Weekend operations',
        createdBy: 'abc-super-001',
        vendorId: '1',
        createdAt: new Date(),
      },
    ] as Schedule[],

    remarks: [
      {
        id: 'abc-remark-001',
        lockId: 'abc-lock-001',
        userId: 'abc-admin-001',
        userName: 'John Smith',
        message: 'ABC Lock inspected and ready for deployment',
        vendorId: '1',
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: 'abc-remark-002',
        lockId: 'abc-lock-002',
        userId: 'abc-track-001',
        userName: 'Mike Wilson',
        message: 'ABC Transport - Started transit to downtown warehouse',
        vendorId: '1',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: 'abc-remark-003',
        lockId: 'abc-lock-003',
        userId: 'abc-track-002',
        userName: 'David Brown',
        message: 'ABC Transport - On reverse route, ETA 1.5 hours',
        vendorId: '1',
        timestamp: new Date(Date.now() - 900000),
      },
    ] as Remark[],

    trips: [
      {
        id: 'abc-trip-001',
        lockId: 'abc-lock-002',
        scheduleId: 'abc-schedule-001',
        vendorId: '1',
        startTime: new Date(Date.now() - 7200000),
        status: 'active' as const,
        distanceKm: 28.5,
        detentionMins: 45,
      },
      {
        id: 'abc-trip-002',
        lockId: 'abc-lock-003',
        scheduleId: 'abc-schedule-002',
        vendorId: '1',
        startTime: new Date(Date.now() - 5400000),
        status: 'active' as const,
        distanceKm: 18.2,
        detentionMins: 30,
      },
      {
        id: 'abc-trip-003',
        lockId: 'abc-lock-004',
        scheduleId: 'abc-schedule-001',
        vendorId: '1',
        startTime: new Date(Date.now() - 10800000),
        endTime: new Date(Date.now() - 3600000),
        status: 'completed' as const,
        distanceKm: 35.7,
        detentionMins: 25,
      },
    ] as Trip[],
  },

  // XYZ Logistics (vendorId: '2')
  '2': {
    locks: [
      {
        id: 'xyz-lock-001',
        lockNumber: 'XYZ-L001',
        status: 'available' as const,
        vendorId: '2',
        lastUpdated: new Date(),
      },
      {
        id: 'xyz-lock-002',
        lockNumber: 'XYZ-L002',
        status: 'in_transit' as const,
        assignedTo: 'xyz-track-001',
        vendorId: '2',
        lastUpdated: new Date(),
      },
      {
        id: 'xyz-lock-003',
        lockNumber: 'XYZ-L003',
        status: 'available' as const,
        vendorId: '2',
        lastUpdated: new Date(),
      },
      {
        id: 'xyz-lock-004',
        lockNumber: 'XYZ-L004',
        status: 'reached' as const,
        vendorId: '2',
        lastUpdated: new Date(),
      },
      {
        id: 'xyz-lock-005',
        lockNumber: 'XYZ-L005',
        status: 'on_reverse_transit' as const,
        assignedTo: 'xyz-track-002',
        vendorId: '2',
        lastUpdated: new Date(),
      },
      {
        id: 'xyz-lock-006',
        lockNumber: 'XYZ-L006',
        status: 'in_transit' as const,
        assignedTo: 'xyz-track-001',
        vendorId: '2',
        lastUpdated: new Date(),
      },
    ] as Lock[],

    schedules: [
      {
        id: 'xyz-schedule-001',
        date: '2024-12-20',
        note: 'XYZ Logistics - Express delivery service',
        createdBy: 'xyz-admin-001',
        vendorId: '2',
        createdAt: new Date(),
      },
      {
        id: 'xyz-schedule-002',
        date: '2024-12-21',
        note: 'XYZ Logistics - International shipment',
        createdBy: 'xyz-admin-001',
        vendorId: '2',
        createdAt: new Date(),
      },
    ] as Schedule[],

    remarks: [
      {
        id: 'xyz-remark-001',
        lockId: 'xyz-lock-002',
        userId: 'xyz-track-001',
        userName: 'Lisa Garcia',
        message: 'XYZ Logistics - Express route initiated',
        vendorId: '2',
        timestamp: new Date(Date.now() - 2700000),
      },
      {
        id: 'xyz-remark-002',
        lockId: 'xyz-lock-005',
        userId: 'xyz-track-002',
        userName: 'James Rodriguez',
        message: 'XYZ Logistics - Return journey in progress',
        vendorId: '2',
        timestamp: new Date(Date.now() - 1200000),
      },
    ] as Remark[],

    trips: [
      {
        id: 'xyz-trip-001',
        lockId: 'xyz-lock-002',
        scheduleId: 'xyz-schedule-001',
        vendorId: '2',
        startTime: new Date(Date.now() - 6300000),
        status: 'active' as const,
        distanceKm: 42.1,
        detentionMins: 60,
      },
      {
        id: 'xyz-trip-002',
        lockId: 'xyz-lock-005',
        scheduleId: 'xyz-schedule-002',
        vendorId: '2',
        startTime: new Date(Date.now() - 4500000),
        status: 'active' as const,
        distanceKm: 31.8,
        detentionMins: 40,
      },
      {
        id: 'xyz-trip-003',
        lockId: 'xyz-lock-006',
        scheduleId: 'xyz-schedule-001',
        vendorId: '2',
        startTime: new Date(Date.now() - 3600000),
        status: 'active' as const,
        distanceKm: 22.4,
        detentionMins: 35,
      },
    ] as Trip[],
  },

  // Global Freight Services (vendorId: '3')
  '3': {
    locks: [
      {
        id: 'gfs-lock-001',
        lockNumber: 'GFS-L001',
        status: 'available' as const,
        vendorId: '3',
        lastUpdated: new Date(),
      },
      {
        id: 'gfs-lock-002',
        lockNumber: 'GFS-L002',
        status: 'in_transit' as const,
        assignedTo: 'gfs-track-001',
        vendorId: '3',
        lastUpdated: new Date(),
      },
      {
        id: 'gfs-lock-003',
        lockNumber: 'GFS-L003',
        status: 'available' as const,
        vendorId: '3',
        lastUpdated: new Date(),
      },
      {
        id: 'gfs-lock-004',
        lockNumber: 'GFS-L004',
        status: 'reached' as const,
        vendorId: '3',
        lastUpdated: new Date(),
      },
    ] as Lock[],

    schedules: [
      {
        id: 'gfs-schedule-001',
        date: '2024-12-20',
        note: 'Global Freight - International cargo route',
        createdBy: 'gfs-admin-001',
        vendorId: '3',
        createdAt: new Date(),
      },
      {
        id: 'gfs-schedule-002',
        date: '2024-12-23',
        note: 'Global Freight - Holiday special delivery',
        createdBy: 'gfs-super-001',
        vendorId: '3',
        createdAt: new Date(),
      },
    ] as Schedule[],

    remarks: [
      {
        id: 'gfs-remark-001',
        lockId: 'gfs-lock-002',
        userId: 'gfs-track-001',
        userName: 'Maria Martinez',
        message: 'Global Freight - International shipment en route',
        vendorId: '3',
        timestamp: new Date(Date.now() - 1800000),
      },
      {
        id: 'gfs-remark-002',
        lockId: 'gfs-lock-004',
        userId: 'gfs-admin-001',
        userName: 'Amanda Taylor',
        message: 'Global Freight - Delivery completed successfully',
        vendorId: '3',
        timestamp: new Date(Date.now() - 600000),
      },
    ] as Remark[],

    trips: [
      {
        id: 'gfs-trip-001',
        lockId: 'gfs-lock-002',
        scheduleId: 'gfs-schedule-001',
        vendorId: '3',
        startTime: new Date(Date.now() - 9000000),
        status: 'active' as const,
        distanceKm: 156.3,
        detentionMins: 120,
      },
      {
        id: 'gfs-trip-002',
        lockId: 'gfs-lock-004',
        scheduleId: 'gfs-schedule-002',
        vendorId: '3',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 1800000),
        status: 'completed' as const,
        distanceKm: 89.7,
        detentionMins: 90,
      },
    ] as Trip[],
  },
};

// Helper functions to get vendor-specific data
export const getVendorData = (vendorId: string) => {
  return DUMMY_DATA[vendorId as keyof typeof DUMMY_DATA] || {
    locks: [],
    schedules: [],
    remarks: [],
    trips: [],
  };
};

export const generateAnalytics = (vendorId: string): Analytics[] => {
  const vendorData = getVendorData(vendorId);
  
  return vendorData.locks.map(lock => {
    const lockTrips = vendorData.trips.filter(trip => trip.lockId === lock.id);
    return {
      lockId: lock.id,
      lockNumber: lock.lockNumber,
      totalTrips: lockTrips.length,
      totalDistance: lockTrips.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0),
      totalDetentionTime: lockTrips.reduce((sum, trip) => sum + (trip.detentionMins || 0), 0),
    };
  });
};

// System-wide analytics for system super admin
export const getSystemAnalytics = (): Analytics[] => {
  const allAnalytics: Analytics[] = [];
  
  Object.keys(DUMMY_DATA).forEach(vendorId => {
    const vendorAnalytics = generateAnalytics(vendorId);
    allAnalytics.push(...vendorAnalytics);
  });
  
  return allAnalytics;
};

// Get vendor-specific lock status for system overview
export const getVendorLockStatus = (vendorId: string) => {
  const vendorData = getVendorData(vendorId);
  return {
    available: vendorData.locks.filter(lock => lock.status === 'available').length,
    inTransit: vendorData.locks.filter(lock => lock.status === 'in_transit').length,
    onReverse: vendorData.locks.filter(lock => lock.status === 'on_reverse_transit').length,
    reached: vendorData.locks.filter(lock => lock.status === 'reached').length,
  };
};