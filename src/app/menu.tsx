import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.logoWrapper}>
          <Image
            source={require('@/assets/images/login-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            Usuario
          </ThemedText>
          <ThemedText type="subtitle">
            {user.first_name} {user.last_name}
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.spacer}>
            Correo
          </ThemedText>
          <ThemedText type="default">{user.email}</ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.spacer}>
            Rol
          </ThemedText>
          <ThemedText type="default">{user.role}</ThemedText>
        </ThemedView>

        <Pressable style={styles.button} onPress={handleSignOut}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            Cerrar sesión
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  logoWrapper: {
    height: 125,
    width: 125,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#171717',
  },
  logo: {
    height: 45,
    width: 110,
  },
  card: {
    width: '100%',
    maxWidth: MaxContentWidth / 2,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.one,
  },
  spacer: {
    marginTop: Spacing.three,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
  },
});
