import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SESSION_KEY = 'hoss.session';

export type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// SecureStore no está disponible en web: usamos localStorage como respaldo.
async function saveSession(value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

async function loadSession() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function clearSession() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession()
      .then((stored) => {
        if (stored) {
          setUser(JSON.parse(stored) as AuthUser);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function signIn(email: string, password: string) {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data?.user) {
      throw new Error(data?.message ?? 'Credenciales inválidas');
    }

    const authUser: AuthUser = {
      id: data.user.id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      email: data.user.email,
      role: data.user.UserRole?.Role?.name ?? 'Sin rol',
      token: data.token,
    };

    setUser(authUser);
    await saveSession(JSON.stringify(authUser));
  }

  async function signOut() {
    setUser(null);
    await clearSession();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
