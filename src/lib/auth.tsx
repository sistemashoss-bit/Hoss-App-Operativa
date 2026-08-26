import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SESSION_KEY = 'hoss.session';

// app-de-hoss autentica solo Accounts (installers, y a futuro customers). El staff
// tiene su propia app/web, así que aquí no existe el actor 'user'.
export type Actor = 'installer' | 'customer';

export type AuthUser = {
  // UUID de la Account (installer/customer).
  id: string;
  actor: Actor;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  token: string;
  installer_id?: number | null;
  customer_id?: number | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Convierte la respuesta { token, actor, profile } (de /auth/login y de
// /auth/invitations/accept) en el AuthUser que guarda la app.
function mapSession(data: any): AuthUser {
  const actor = data.actor as Actor;
  const profile = data.profile ?? {};

  // La Account no tiene nombre propio: el installer los toma de su Installer ligado.
  let first_name = '';
  let last_name = '';
  if (actor === 'installer' && profile.installer) {
    first_name = profile.installer.first_name ?? '';
    last_name = profile.installer.last_name ?? '';
  }

  return {
    id: profile.id,
    actor,
    first_name,
    last_name,
    email: profile.email,
    role: profile.role ?? null,
    token: data.token,
    installer_id: profile.installer_id ?? null,
    customer_id: profile.customer_id ?? null,
  };
}

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

  async function commitSession(data: any) {
    const authUser = mapSession(data);
    setUser(authUser);
    await saveSession(JSON.stringify(authUser));
    return authUser;
  }

  async function signIn(email: string, password: string) {
    // Login de account (installer/customer): el server valida y devuelve
    // { token, actor, profile }. El staff usa su propio login, no este endpoint.
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data?.token) {
      throw new Error(data?.error ?? data?.message ?? 'Credenciales inválidas');
    }

    return commitSession(data);
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
