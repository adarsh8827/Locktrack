// Dummy authentication service with multi-vendor support for development
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Vendor } from '@/types';

const AUTH_TOKEN_KEY = 'dummy_auth_token';
const USER_DATA_KEY = 'dummy_user_data';

// Demo vendors
export const DEMO_VENDORS: Vendor[] = [
  {
    id: '1',
    vendorName: 'ABC Transport Co.',
    vendorCode: 'ABC001',
    description: 'Leading transport and logistics company',
    contactEmail: 'admin@abctransport.com',
    contactPhone: '+1-555-0101',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    vendorName: 'XYZ Logistics Ltd.',
    vendorCode: 'XYZ002',
    description: 'Premium logistics and supply chain solutions',
    contactEmail: 'contact@xyzlogistics.com',
    contactPhone: '+1-555-0202',
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    vendorName: 'Global Freight Services',
    vendorCode: 'GFS003',
    description: 'International freight and cargo services',
    contactEmail: 'info@globalfreight.com',
    contactPhone: '+1-555-0303',
    isActive: true,
    createdAt: new Date('2024-02-01'),
  },
];

// Demo users for each vendor + System Super Admins
export const DEMO_USERS: User[] = [
  // System Super Admins (not tied to any vendor)
  {
    id: 'system-super-001',
    email: 'superadmin@excisemia.com',
    name: 'System Administrator',
    role: 'superadmin',
    vendorId: 'system',
    vendorName: 'Excise MIA System',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'system-super-002',
    email: 'admin@excisemia.com',
    name: 'Platform Admin',
    role: 'superadmin',
    vendorId: 'system',
    vendorName: 'Excise MIA System',
    createdAt: new Date('2024-01-01'),
  },

  // ABC Transport Co. Users
  {
    id: 'abc-admin-001',
    email: 'admin@abctransport.com',
    name: 'John Smith',
    role: 'admin',
    vendorId: '1',
    vendorName: 'ABC Transport Co.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'abc-super-001',
    email: 'super@abctransport.com',
    name: 'Sarah Johnson',
    role: 'superadmin',
    vendorId: '1',
    vendorName: 'ABC Transport Co.',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'abc-track-001',
    email: 'tracking@abctransport.com',
    name: 'Mike Wilson',
    role: 'tracking',
    vendorId: '1',
    vendorName: 'ABC Transport Co.',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: 'abc-track-002',
    email: 'driver1@abctransport.com',
    name: 'David Brown',
    role: 'tracking',
    vendorId: '1',
    vendorName: 'ABC Transport Co.',
    createdAt: new Date('2024-01-03'),
  },

  // XYZ Logistics Users
  {
    id: 'xyz-admin-001',
    email: 'admin@xyzlogistics.com',
    name: 'Emily Davis',
    role: 'admin',
    vendorId: '2',
    vendorName: 'XYZ Logistics Ltd.',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'xyz-super-001',
    email: 'super@xyzlogistics.com',
    name: 'Robert Chen',
    role: 'superadmin',
    vendorId: '2',
    vendorName: 'XYZ Logistics Ltd.',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'xyz-track-001',
    email: 'tracking@xyzlogistics.com',
    name: 'Lisa Garcia',
    role: 'tracking',
    vendorId: '2',
    vendorName: 'XYZ Logistics Ltd.',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'xyz-track-002',
    email: 'driver1@xyzlogistics.com',
    name: 'James Rodriguez',
    role: 'tracking',
    vendorId: '2',
    vendorName: 'XYZ Logistics Ltd.',
    createdAt: new Date('2024-01-17'),
  },

  // Global Freight Services Users
  {
    id: 'gfs-admin-001',
    email: 'admin@globalfreight.com',
    name: 'Amanda Taylor',
    role: 'admin',
    vendorId: '3',
    vendorName: 'Global Freight Services',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'gfs-super-001',
    email: 'super@globalfreight.com',
    name: 'Kevin Lee',
    role: 'superadmin',
    vendorId: '3',
    vendorName: 'Global Freight Services',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'gfs-track-001',
    email: 'tracking@globalfreight.com',
    name: 'Maria Martinez',
    role: 'tracking',
    vendorId: '3',
    vendorName: 'Global Freight Services',
    createdAt: new Date('2024-02-02'),
  },
  {
    id: 'gfs-track-002',
    email: 'driver1@globalfreight.com',
    name: 'Thomas Anderson',
    role: 'tracking',
    vendorId: '3',
    vendorName: 'Global Freight Services',
    createdAt: new Date('2024-02-03'),
  },
];

// Demo credentials (password is always "demo123" for all users)
const DEMO_CREDENTIALS: Record<string, string> = {};
DEMO_USERS.forEach(user => {
  DEMO_CREDENTIALS[user.email] = 'demo123';
});

export class DummyAuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadStoredUser();
  }

  private async loadStoredUser() {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.log('No stored user found');
    }
  }

  private async storeUser(user: User | null) {
    try {
      if (user) {
        const token = `dummy_token_${user.id}_${Date.now()}`;
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
      }
    } catch (error) {
      console.log('Could not store user');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async signIn(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const expectedPassword = DEMO_CREDENTIALS[email];
    if (!expectedPassword || expectedPassword !== password) {
      throw new Error('Invalid email or password');
    }

    const user = DEMO_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    this.currentUser = user;
    await this.storeUser(user);
    this.notifyListeners();
    return user;
  }

  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    this.currentUser = null;
    await this.storeUser(null);
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get vendor information
  getVendorById(vendorId: string): Vendor | null {
    return DEMO_VENDORS.find(v => v.id === vendorId) || null;
  }

  // Get all vendors (Super Admin only)
  getAllVendors(): Vendor[] {
    return DEMO_VENDORS;
  }

  // Get users by vendor
  getUsersByVendor(vendorId: string): User[] {
    return DEMO_USERS.filter(u => u.vendorId === vendorId);
  }

  // Get all users (System Super Admin only)
  getAllUsers(): User[] {
    return DEMO_USERS;
  }

  // Check if user is system super admin
  isSystemSuperAdmin(user: User | null): boolean {
    return user?.vendorId === 'system' && user?.role === 'superadmin';
  }

  // Add new vendor (System Super Admin only)
  addVendor(vendorData: Omit<Vendor, 'id' | 'createdAt'>): Vendor {
    const newVendor: Vendor = {
      ...vendorData,
      id: `vendor-${Date.now()}`,
      createdAt: new Date(),
    };
    DEMO_VENDORS.push(newVendor);
    return newVendor;
  }

  // Update vendor (System Super Admin only)
  updateVendor(vendorId: string, vendorData: Partial<Vendor>): Vendor | null {
    const vendorIndex = DEMO_VENDORS.findIndex(v => v.id === vendorId);
    if (vendorIndex === -1) return null;

    DEMO_VENDORS[vendorIndex] = {
      ...DEMO_VENDORS[vendorIndex],
      ...vendorData,
    };
    return DEMO_VENDORS[vendorIndex];
  }

  // Deactivate vendor (System Super Admin only)
  deactivateVendor(vendorId: string): boolean {
    const vendorIndex = DEMO_VENDORS.findIndex(v => v.id === vendorId);
    if (vendorIndex === -1) return false;

    DEMO_VENDORS[vendorIndex].isActive = false;
    return true;
  }
}

export const dummyAuthService = new DummyAuthService();