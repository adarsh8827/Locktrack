import { Platform } from 'react-native';

// API Configuration
const API_CONFIG = {
  // Development - use your computer's IP for mobile testing
  DEV_BASE_URL: Platform.select({
    web: 'http://localhost:8080/api',
    default: 'http://192.168.1.4:8080/api', // Replace with your computer's IP
  }),
  
  // Production - your deployed server
  PROD_BASE_URL: 'https://your-api.herokuapp.com/api',
};

const BASE_URL = __DEV__ ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;

// Auth token storage
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`API Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${errorText}`);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    const response = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  signUp: async (userData: {
    name: string;
    email: string;
    password: string;
    vendorId: string;
    phone?: string;
    department?: string;
  }) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        vendorId: parseInt(userData.vendorId),
      }),
    });
    
    return response;
  },

  signOut: async () => {
    const response = await apiRequest('/auth/signout', {
      method: 'POST',
    });
    setAuthToken(null);
    return response;
  },

  validateToken: async (token: string) => {
    const response = await apiRequest('/auth/validate-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response;
  },
};

// Users API (Super Admin access)
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  getByVendor: (vendorId: number) => apiRequest(`/users/vendor/${vendorId}`),
  getProfile: () => apiRequest('/users/profile'),
  updateRole: (userId: number, role: string) => apiRequest(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  activate: (userId: number) => apiRequest(`/users/${userId}/activate`, {
    method: 'PUT',
  }),
  deactivate: (userId: number) => apiRequest(`/users/${userId}/deactivate`, {
    method: 'PUT',
  }),
  delete: (userId: number) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  }),
};

// Vendors API (System Super Admin only)
export const vendorsAPI = {
  getAll: () => apiRequest('/vendors'),
  create: (vendorData: any) => apiRequest('/vendors', {
    method: 'POST',
    body: JSON.stringify(vendorData),
  }),
  update: (id: number, vendorData: any) => apiRequest(`/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vendorData),
  }),
  delete: (id: number) => apiRequest(`/vendors/${id}`, {
    method: 'DELETE',
  }),
};

// Locks API (vendor-scoped)
export const locksAPI = {
  getAll: () => apiRequest('/locks'),
  create: (lockNumber: string) => apiRequest('/locks', {
    method: 'POST',
    body: JSON.stringify({ lockNumber }),
  }),
  updateStatus: (id: number, status: string) => apiRequest(`/locks/${id}/status?status=${status}`, {
    method: 'PUT',
  }),
  assign: (id: number, userId: number) => apiRequest(`/locks/${id}/assign?userId=${userId}`, {
    method: 'PUT',
  }),
};

// Schedules API (vendor-scoped)
export const schedulesAPI = {
  getAll: () => apiRequest('/schedules'),
  create: (date: string, note?: string) => apiRequest('/schedules', {
    method: 'POST',
    body: JSON.stringify({ date, note }),
  }),
  delete: (id: number) => apiRequest(`/schedules/${id}`, {
    method: 'DELETE',
  }),
};

// Remarks API (vendor-scoped)
export const remarksAPI = {
  getAll: () => apiRequest('/remarks'),
  getByLock: (lockId: number) => apiRequest(`/remarks/lock/${lockId}`),
  create: (lockId: number, message: string) => apiRequest('/remarks', {
    method: 'POST',
    body: JSON.stringify({ lockId, message }),
  }),
};

// Analytics API (vendor-scoped)
export const analyticsAPI = {
  getAll: () => apiRequest('/analytics'),
};