import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { wsService } from '../services/ws';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  twoFactorEnabled: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (user && token) {
      wsService.connect(token);
    }
    return () => {
      if (!user) {
        wsService.disconnect();
      }
    };
  }, [user]);

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const data = await api.login(email, password);
    
    if (data.requiresTwoFactor && !twoFactorCode) {
      throw new Error('2FA_REQUIRED');
    }

    if (twoFactorCode) {
      await api.verify2FA(twoFactorCode);
    }

    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    await refreshUser();
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.register(email, password, name);
    localStorage.setItem('accessToken', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    await refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    wsService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
