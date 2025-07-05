import React, { createContext, useContext, useEffect, useState } from 'react';
import { springAuthService } from '@/services/springBootService';
import { User } from '@/types';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: {
    name: string;
    email: string;
    password: string;
    vendorId: string;
    phone?: string;
    department?: string;
  }) => Promise<{ message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => ({ message: '' }),
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = springAuthService.onAuthStateChanged((user: User | null) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await springAuthService.signIn(email, password);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (userData: {
    name: string;
    email: string;
    password: string;
    vendorId: string;
    phone?: string;
    department?: string;
  }) => {
    try {
      const result = await springAuthService.signUp(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await springAuthService.signOut();
      setUser(null);
      // Navigate back to home page
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout even if API call fails
      setUser(null);
      router.replace('/');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};