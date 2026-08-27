import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { router, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

// Deep-link al tocar una notificación: por ahora solo "nueva cita" → /cita/[id].
function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response?.notification?.request?.content?.data as
    | { type?: string; appointment_id?: number | string }
    | undefined;
  if (data?.type === 'appointment' && data?.appointment_id != null) {
    router.push({
      pathname: '/cita/[id]',
      params: { id: String(data.appointment_id) },
    });
  }
}

function RootNavigator() {
  const { isLoading } = useAuth();

  // Tap con la app abierta/en background.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    );
    return () => sub.remove();
  }, []);

  // Tap desde app cerrada (cold start): la última respuesta persiste.
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledCold = useRef(false);
  useEffect(() => {
    if (!isLoading && lastResponse && !handledCold.current) {
      handledCold.current = true;
      handleNotificationResponse(lastResponse);
    }
  }, [isLoading, lastResponse]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="citas" />
      <Stack.Screen name="cita/[id]" />
      <Stack.Screen name="change-password" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
