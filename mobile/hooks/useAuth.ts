import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens, LoginCredentials, RegisterCredentials, BiometricAuthConfig } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  biometricConfig: BiometricAuthConfig;
}

interface AuthActions {
  login: (credentials: LoginCredentials, useBiometric?: boolean) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  checkBiometricSupport: () => Promise<BiometricAuthConfig>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  biometricConfig: {
    enabled: false,
    type: null,
  },

  // Actions
  login: async (credentials: LoginCredentials, useBiometric = false) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await api.login(credentials);
      
      set({
        user: result.user,
        tokens: result.tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      // Store credentials for biometric auth if enabled
      if (useBiometric && get().biometricConfig.enabled) {
        await SecureStore.setItemAsync(
          BIOMETRIC_CREDENTIALS_KEY,
          JSON.stringify({ email: credentials.email, password: credentials.password })
        );
      }
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Login failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    try {
      set({ isLoading: true, error: null });
      
      const result = await api.register(credentials);
      
      set({
        user: result.user,
        tokens: result.tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Registration failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  refreshUser: async () => {
    try {
      const user = await api.getCurrentUser();
      set({ user });
    } catch (error: any) {
      console.error('Failed to refresh user:', error);
      set({ error: error.message });
    }
  },

  updateUser: (userData: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    }));
  },

  checkBiometricSupport: async (): Promise<BiometricAuthConfig> => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        let type: 'fingerprint' | 'face' | 'iris' | null = null;
        
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          type = 'face';
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          type = 'fingerprint';
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          type = 'iris';
        }

        const config = { enabled: false, type };
        set({ biometricConfig: config });
        return config;
      }
      
      const config = { enabled: false, type: null };
      set({ biometricConfig: config });
      return config;
    } catch (error) {
      console.error('Biometric check error:', error);
      return { enabled: false, type: null };
    }
  },

  enableBiometric: async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        const config = await get().checkBiometricSupport();
        set({ biometricConfig: { ...config, enabled: true } });
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Enable biometric error:', error);
      return false;
    }
  },

  disableBiometric: async () => {
    try {
      set((state) => ({
        biometricConfig: { ...state.biometricConfig, enabled: false },
      }));
      await SecureStore.deleteItemAsync('biometric_enabled');
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    } catch (error) {
      console.error('Disable biometric error:', error);
    }
  },

  authenticateWithBiometric: async (): Promise<boolean> => {
    try {
      const { biometricConfig } = get();
      if (!biometricConfig.enabled || !biometricConfig.type) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Get stored credentials
        const credentialsJson = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
        if (credentialsJson) {
          const credentials = JSON.parse(credentialsJson);
          await get().login(credentials, false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      
      // Check if user was previously authenticated
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (accessToken) {
        const user = await api.getCurrentUser();
        set({ user, isAuthenticated: true });
      }

      // Check biometric configuration
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
      if (biometricEnabled === 'true') {
        const config = await get().checkBiometricSupport();
        set({ biometricConfig: { ...config, enabled: true } });
      } else {
        await get().checkBiometricSupport();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isAuthenticated: false, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
