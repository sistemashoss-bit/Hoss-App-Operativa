import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Registro de push notifications (Expo). Por ahora solo "nueva cita asignada".
// Push remoto requiere un development build (no funciona en Expo Go en Android desde
// SDK 53) — la app ya usa expo-dev-client, así que ok.
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Cómo se muestran las notificaciones con la app en primer plano (API de SDK 57).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Obtiene (o pide permiso y obtiene) el ExponentPushToken de ESTE dispositivo.
// Devuelve null si no aplica (web/emulador) o si el usuario negó permisos.
async function getExpoToken(): Promise<string | null> {
  // Push real solo en dispositivo físico; en web/emulador no hay token.
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    return null;
  }

  // Android necesita un canal para que aparezca el prompt de permisos.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') {
    return null;
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

// Registra el token de este dispositivo en hoss-api (llamar tras iniciar sesión).
export async function registerPushToken(sessionToken: string): Promise<void> {
  try {
    const token = await getExpoToken();
    if (!token) return;
    await fetch(`${API_URL}/auth/push-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
  } catch {
    // Best-effort: si falla el registro, la app sigue funcionando sin push.
  }
}

// Da de baja el token de este dispositivo (llamar ANTES de limpiar la sesión).
export async function unregisterPushToken(sessionToken: string): Promise<void> {
  try {
    const token = await getExpoToken();
    if (!token) return;
    await fetch(`${API_URL}/auth/push-tokens`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch {
    // Best-effort.
  }
}
