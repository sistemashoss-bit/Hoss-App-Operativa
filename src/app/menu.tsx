import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const ACCENT = '#D4B766';
const DRAWER_WIDTH = 300;

type MenuOption = {
  key: string;
  label: string;
  icon: string;
};

const OPTIONS: MenuOption[] = [
  { key: 'instalaciones', label: 'Instalaciones', icon: '🔧' },
  { key: 'transferencias', label: 'Transferencias', icon: '🔁' },
  { key: 'recepciones', label: 'Recepciones', icon: '📦' },
  { key: 'inventarios', label: 'Inventarios', icon: '📋' },
];

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  if (!user) {
    return <Redirect href="/" />;
  }

  function openDrawer() {
    setDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }

  function closeDrawer() {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setDrawerOpen(false);
    });
  }

  async function handleSignOut() {
    closeDrawer();
    await signOut();
    router.replace('/');
  }

  function handleSelect(option: MenuOption) {
    // TODO: navegar a la pantalla de cada módulo cuando existan.
    // router.push(`/${option.key}`);
  }

  // Dos columnas en pantallas anchas, una sola en pantallas angostas.
  const cardBasis = width < 480 ? '100%' : '47%';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Barra superior con botón hamburguesa */}
        <View style={styles.topBar}>
          <Pressable
            onPress={openDrawer}
            hitSlop={12}
            style={styles.hamburger}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú">
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </Pressable>

          <Image
            source={require('@/assets/images/login-logo.png')}
            style={styles.topLogo}
            contentFit="contain"
          />

          <View style={styles.hamburger} />
        </View>

        {/* Cards de módulos */}
        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.heading}>
            Menú
          </ThemedText>

          <View style={styles.grid}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => handleSelect(option)}
                style={({ pressed }) => [{ width: cardBasis }, pressed && styles.cardPressed]}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText style={styles.cardIcon}>{option.icon}</ThemedText>
                  <ThemedText type="smallBold" style={styles.cardLabel}>
                    {option.label}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Drawer lateral */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
        </Animated.View>

        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <ThemedView type="background" style={styles.drawerInner}>
            <SafeAreaView edges={['top', 'left', 'bottom']} style={styles.drawerContent}>
              <View style={styles.drawerHeader}>
                <ThemedText type="small" themeColor="textSecondary">
                  Bienvenido
                </ThemedText>
                <ThemedText type="subtitle" style={styles.drawerName}>
                  {user.first_name} {user.last_name}
                </ThemedText>
              </View>

              <View style={styles.drawerField}>
                <ThemedText type="small" themeColor="textSecondary">
                  Rol
                </ThemedText>
                <ThemedText type="default">{user.role}</ThemedText>
              </View>

              <View style={styles.drawerField}>
                <ThemedText type="small" themeColor="textSecondary">
                  Correo
                </ThemedText>
                <ThemedText type="default">{user.email}</ThemedText>
              </View>

              <View style={styles.drawerSpacer} />

              <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                <ThemedText type="smallBold" style={styles.signOutText}>
                  Cerrar sesión
                </ThemedText>
              </Pressable>
            </SafeAreaView>
          </ThemedView>
        </Animated.View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  hamburger: {
    width: 28,
    height: 22,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: ACCENT,
  },
  topLogo: {
    height: 32,
    width: 90,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  heading: {
    marginBottom: Spacing.four,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  card: {
    minHeight: 130,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(212, 183, 102, 0.35)',
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardIcon: {
    fontSize: 40,
    lineHeight: 48,
  },
  cardLabel: {
    textAlign: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
  },
  drawerInner: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: 'rgba(212, 183, 102, 0.35)',
  },
  drawerContent: {
    flex: 1,
    padding: Spacing.four,
  },
  drawerHeader: {
    marginBottom: Spacing.four,
  },
  drawerName: {
    fontSize: 24,
    lineHeight: 32,
  },
  drawerField: {
    marginTop: Spacing.three,
    gap: Spacing.half,
  },
  drawerSpacer: {
    flex: 1,
  },
  signOutButton: {
    backgroundColor: ACCENT,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  signOutText: {
    color: '#111111',
    letterSpacing: 1,
  },
});
