// Spring Boot service integration with multi-vendor support
import { User, Lock, Schedule, Trip, Remark, Analytics, Vendor } from '@/types';
import { authAPI, locksAPI, schedulesAPI, remarksAPI, analyticsAPI, setAuthToken, getAuthToken, usersAPI, vendorsAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Authentication service
export const springAuthService = {
  signIn: async (email: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.signIn(email, password);
      
      const user: User = {
        id: response.id.toString(),
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase(),
        vendorId: response.vendorId.toString(),
        vendorName: response.vendorName,
        createdAt: new Date(),
        isActive: true,
      };

      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  signUp: async (userData: {
    name: string;
    email: string;
    password: string;
    vendorId: string;
    phone?: string;
    department?: string;
  }): Promise<{ message: string }> => {
    try {
      const response = await authAPI.signUp(userData);
      return response;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await authAPI.signOut();
      setAuthToken(null);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if API call fails
      setAuthToken(null);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (userData && token) {
        setAuthToken(token);
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    let isActive = true;
    
    // Check for stored user on initialization
    const checkStoredUser = async () => {
      if (!isActive) return;
      
      try {
        const user = await springAuthService.getCurrentUser();
        callback(user);
      } catch (error) {
        console.error('Auth state check error:', error);
        callback(null);
      }
    };

    checkStoredUser();

    // Return unsubscribe function
    return () => {
      isActive = false;
    };
  },

  // User management functions
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await usersAPI.getAll();
      return response.map((user: any) => ({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        vendorId: user.vendorId.toString(),
        vendorName: user.vendor?.vendorName || 'Unknown',
        createdAt: new Date(user.createdAt),
        isActive: user.isActive,
        phone: user.phone,
        department: user.department,
      }));
    } catch (error: any) {
      console.error('Get all users error:', error);
      throw new Error(error.message || 'Failed to fetch users');
    }
  },

  updateUserRole: async (userId: string, role: string): Promise<void> => {
    try {
      await usersAPI.updateRole(parseInt(userId), role);
    } catch (error: any) {
      console.error('Update user role error:', error);
      throw new Error(error.message || 'Failed to update user role');
    }
  },

  activateUser: async (userId: string): Promise<void> => {
    try {
      await usersAPI.activate(parseInt(userId));
    } catch (error: any) {
      console.error('Activate user error:', error);
      throw new Error(error.message || 'Failed to activate user');
    }
  },

  deactivateUser: async (userId: string): Promise<void> => {
    try {
      await usersAPI.deactivate(parseInt(userId));
    } catch (error: any) {
      console.error('Deactivate user error:', error);
      throw new Error(error.message || 'Failed to deactivate user');
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await usersAPI.delete(parseInt(userId));
    } catch (error: any) {
      console.error('Delete user error:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  },

  // Vendor management functions
  getAllVendors: async (): Promise<Vendor[]> => {
    try {
      const response = await vendorsAPI.getAll();
      return response.map((vendor: any) => ({
        id: vendor.id.toString(),
        vendorName: vendor.vendorName,
        vendorCode: vendor.vendorCode,
        description: vendor.description,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        isActive: vendor.isActive,
        createdAt: new Date(vendor.createdAt),
      }));
    } catch (error: any) {
      console.error('Get all vendors error:', error);
      throw new Error(error.message || 'Failed to fetch vendors');
    }
  },
};

// Lock operations (vendor-scoped)
export const addLock = async (lockData: Omit<Lock, 'id'>): Promise<string> => {
  const response = await locksAPI.create(lockData.lockNumber);
  return response.id.toString();
};

export const updateLockStatus = async (lockId: string, status: Lock['status']): Promise<void> => {
  const springStatus = status.toUpperCase();
  await locksAPI.updateStatus(parseInt(lockId), springStatus);
};

export const getLocks = async (): Promise<Lock[]> => {
  const response = await locksAPI.getAll();
  return response.map((lock: any) => ({
    id: lock.id.toString(),
    lockNumber: lock.lockNumber,
    status: lock.status.toLowerCase(),
    assignedTo: lock.assignedTo?.toString(),
    currentTripId: lock.currentTripId?.toString(),
    vendorId: lock.vendorId.toString(),
    lastUpdated: new Date(lock.lastUpdated),
  }));
};

// Schedule operations (vendor-scoped)
export const addSchedule = async (scheduleData: Omit<Schedule, 'id'>): Promise<string> => {
  const response = await schedulesAPI.create(scheduleData.date, scheduleData.note);
  return response.id.toString();
};

export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await schedulesAPI.getAll();
  return response.map((schedule: any) => ({
    id: schedule.id.toString(),
    date: schedule.date,
    note: schedule.note,
    createdBy: schedule.createdBy.toString(),
    vendorId: schedule.vendorId.toString(),
    createdAt: new Date(schedule.createdAt),
  }));
};

export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await schedulesAPI.delete(parseInt(scheduleId));
};

// Trip operations (vendor-scoped)
export const addTrip = async (tripData: Omit<Trip, 'id'>): Promise<string> => {
  // Implement trip creation API call
  throw new Error('Trip creation not implemented yet');
};

export const updateTrip = async (tripId: string, tripData: Partial<Trip>): Promise<void> => {
  // Implement trip update API call
  throw new Error('Trip update not implemented yet');
};

// Remarks operations (vendor-scoped)
export const addRemark = async (remarkData: Omit<Remark, 'id'>): Promise<string> => {
  const response = await remarksAPI.create(parseInt(remarkData.lockId), remarkData.message);
  return response.id.toString();
};

export const getRemarksByLock = async (lockId: string): Promise<Remark[]> => {
  const response = await remarksAPI.getByLock(parseInt(lockId));
  return response.map((remark: any) => ({
    id: remark.id.toString(),
    lockId: remark.lockId.toString(),
    userId: remark.userId.toString(),
    userName: remark.userName,
    message: remark.message,
    vendorId: remark.vendorId.toString(),
    timestamp: new Date(remark.timestamp),
  }));
};

// Analytics operations (vendor-scoped)
export const getAnalytics = async (): Promise<Analytics[]> => {
  const response = await analyticsAPI.getAll();
  return response.map((analytics: any) => ({
    lockId: analytics.lockId.toString(),
    lockNumber: analytics.lockNumber,
    totalTrips: analytics.totalTrips,
    totalDistance: analytics.totalDistance,
    totalDetentionTime: analytics.totalDetentionTime,
  }));
};