// Mock authentication service for development
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'tracking';
  createdAt: Date;
}

// Mock user database
const MOCK_USERS: MockUser[] = [
  {
    id: 'admin-001',
    email: 'admin@excisemia.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'superadmin-001',
    email: 'superadmin@excisemia.com',
    name: 'Super Admin',
    role: 'superadmin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'tracking-001',
    email: 'tracking@excisemia.com',
    name: 'Tracking Team',
    role: 'tracking',
    createdAt: new Date('2024-01-01'),
  },
];

// Mock credentials
const MOCK_CREDENTIALS = {
  'admin@excisemia.com': 'admin123',
  'superadmin@excisemia.com': 'super123',
  'tracking@excisemia.com': 'track123',
};

export class MockAuthService {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Check for stored user on initialization
    this.loadStoredUser();
  }

  private loadStoredUser() {
    try {
      const storedUser = localStorage.getItem('mockAuthUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        this.notifyListeners();
      }
    } catch (error) {
      console.log('No stored user found');
    }
  }

  private storeUser(user: MockUser | null) {
    try {
      if (user) {
        localStorage.setItem('mockAuthUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('mockAuthUser');
      }
    } catch (error) {
      console.log('Could not store user');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const expectedPassword = MOCK_CREDENTIALS[email as keyof typeof MOCK_CREDENTIALS];
    if (!expectedPassword || expectedPassword !== password) {
      throw new Error('Invalid email or password');
    }

    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    this.currentUser = user;
    this.storeUser(user);
    this.notifyListeners();
    return user;
  }

  async signOut(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    this.currentUser = null;
    this.storeUser(null);
    this.notifyListeners();
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
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
}

export const mockAuthService = new MockAuthService();