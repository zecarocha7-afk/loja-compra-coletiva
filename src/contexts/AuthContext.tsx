import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseService } from '../services/firebaseService';
import { User, MilitaryProfile } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profile: Omit<MilitaryProfile, 'createdAt' | 'updatedAt'>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthChange((fbUser) => {
      const initUser = async () => {
        if (fbUser) {
          try {
            const profile = await firebaseService.getUserProfile(fbUser.uid);
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              profile: profile || undefined
            });
          } catch (err) {
            console.error("Failed to load user profile:", err);
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      };
      
      initUser();
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await firebaseService.login(email, password);
  };

  const register = async (email: string, password: string, profile: Omit<MilitaryProfile, 'createdAt' | 'updatedAt'>) => {
    await firebaseService.register(email, password, profile);
  };

  const logout = async () => {
    await firebaseService.logout();
  };

  const resetPassword = async (email: string) => {
    await firebaseService.resetPassword(email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
