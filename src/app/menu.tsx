import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth';

const GOLD = '#D4B766';
const BLACK = '#111111';
const BLACK_SOFT = '#1B1B1B';

const BACKGROUND = '#F7F7F7';

const TEXT_PRIMARY = '#1A1A1A';

const DANGER = '#D77A7A';
const DRAWER_WIDTH = 300;

type MenuOption = {
  key: string;
  label: string;
  subtitle?: string;
  icon: string;
  status?: 'danger' | 'active' | 'neutral';
};

const OPTIONS: MenuOption[] = [
  {
    key: 'recepciones',
    label: 'Recepciones',
    subtitle: '3 pendientes',
    icon: '□',
    status: 'danger',
  },
  {
    key: 'transferencias',
    label: 'Transferencias',
    subtitle: '5 activas',
    icon: '⇄',
    status: 'active',
  },
  {
    key: 'inventarios',
    label: 'Inventarios',
    subtitle: 'Consultar inventario',
    icon: '≡',
    status: 'neutral',
  },
  {
    key: 'instalaciones',
    label: 'Instalaciones',
    subtitle: '4 pendientes',
    icon: '◇',
    status: 'danger',
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const slideAnim = useRef(
    new Animated.Value(-DRAWER_WIDTH)
  ).current;

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  if (!user) {
    return <Redirect href="/" />;
  }

  function openDrawer() {
    setDrawerOpen(true);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeDrawer() {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setDrawerOpen(false);
      }
    });
  }

  async function handleSignOut() {
    closeDrawer();

    await signOut();

    router.replace('/');
  }

  function handleSelect(option: MenuOption) {
    console.log(`Seleccionado: ${option.key}`);

    // Cuando existan las rutas:
    // router.push(`/${option.key}`);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        {/* HEADER */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable
              onPress={openDrawer}
              hitSlop={12}
              style={styles.hamburger}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
            >
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </Pressable>

            <ThemedText style={styles.headerTitle}>
              HOSS Mobile
            </ThemedText>
          </View>

          <Pressable
            onPress={openDrawer}
            style={styles.profileButton}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <View style={styles.profileHead} />
            <View style={styles.profileBody} />
          </Pressable>
        </View>

        {/* CONTENIDO */}
        <View style={styles.content}>
          <View style={styles.operationsContainer}>
            <ThemedText style={styles.sectionTitle}>
              OPERACIONES
            </ThemedText>

            <View style={styles.menuList}>
              {OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() => handleSelect(option)}
                  style={({ pressed }) => [
                    styles.menuButton,
                    pressed && styles.menuButtonPressed,
                  ]}
                >
                  {/* ICONO */}
                  <View style={styles.menuButtonIcon}>
                    <ThemedText style={styles.menuIcon}>
                      {option.icon}
                    </ThemedText>
                  </View>

                  {/* TEXTO */}
                  <View style={styles.menuButtonContent}>
                    <ThemedText style={styles.menuButtonLabel}>
                      {option.label}
                    </ThemedText>

                    {option.subtitle && (
                      <ThemedText
                        style={[
                          styles.menuButtonSubtitle,

                          option.status === 'danger' &&
                            styles.subtitleDanger,

                          option.status === 'active' &&
                            styles.subtitleActive,
                        ]}
                      >
                        {option.subtitle}
                      </ThemedText>
                    )}
                  </View>

                  {/* FLECHA */}
                  <ThemedText style={styles.menuChevron}>
                    ›
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* DRAWER LATERAL */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
        {/* Fondo oscuro */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeDrawer}
          />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [
                {
                  translateX: slideAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.drawerInner}>
            <SafeAreaView
              edges={['top', 'left', 'bottom']}
              style={styles.drawerContent}
            >
              {/* Usuario */}
              <View style={styles.drawerProfile}>
                <View style={styles.drawerAvatar}>
                  <View style={styles.drawerAvatarHead} />
                  <View style={styles.drawerAvatarBody} />
                </View>

                <View style={styles.drawerUserInfo}>
                  <ThemedText style={styles.drawerWelcome}>
                    Bienvenido
                  </ThemedText>

                  <ThemedText style={styles.drawerName}>
                    {user.first_name} {user.last_name}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Rol */}
              <View style={styles.drawerField}>
                <ThemedText style={styles.drawerFieldLabel}>
                  Rol
                </ThemedText>

                <ThemedText style={styles.drawerFieldValue}>
                  {user.role}
                </ThemedText>
              </View>

              {/* Correo */}
              <View style={styles.drawerField}>
                <ThemedText style={styles.drawerFieldLabel}>
                  Correo
                </ThemedText>

                <ThemedText style={styles.drawerFieldValue}>
                  {user.email}
                </ThemedText>
              </View>

              <View style={styles.drawerSpacer} />

              {/* Cerrar sesión */}
              <Pressable
                style={({ pressed }) => [
                  styles.signOutButton,
                  pressed && styles.signOutPressed,
                ]}
                onPress={handleSignOut}
              >
                <ThemedText style={styles.signOutIcon}>
                  ↪
                </ThemedText>

                <ThemedText style={styles.signOutText}>
                  Cerrar sesión
                </ThemedText>
              </Pressable>
            </SafeAreaView>
          </View>
        </Animated.View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  /* GENERAL */

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  /* HEADER */

  topBar: {
    height: 64,
    backgroundColor: BLACK,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 18,

    borderBottomWidth: 2,
    borderBottomColor: GOLD,
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  hamburger: {
    width: 25,
    height: 18,
    justifyContent: 'space-between',
  },

  hamburgerLine: {
    height: 2,
    borderRadius: 2,
    backgroundColor: GOLD,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },

  /* PERFIL */

  profileButton: {
    width: 36,
    height: 36,

    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: GOLD,

    backgroundColor: BLACK_SOFT,

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileHead: {
    width: 9,
    height: 9,

    borderRadius: 5,
    borderWidth: 2,
    borderColor: GOLD,

    marginBottom: 2,
  },

  profileBody: {
    width: 15,
    height: 8,

    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,

    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: GOLD,
  },

  /* CONTENIDO */

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  operationsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },

  sectionTitle: {
    color: TEXT_PRIMARY,
fontSize: 16,
  lineHeight: 22,
  fontWeight: '700',
  letterSpacing: 1.4,
  textAlign: 'center',
  marginBottom: 28,
  },

  /* MENÚ */

  menuList: {
    width: '100%',
    gap: 14,
  },

  menuButton: {
    width: '100%',
    minHeight: 78,

    backgroundColor: '#171717',

    borderRadius: 15,

    borderWidth: 1,
    borderColor: 'rgba(212, 183, 102, 0.30)',

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,
    paddingVertical: 13,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.12,
    shadowRadius: 6,

    elevation: 3,
  },

  menuButtonPressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* ICONO DEL MENÚ */

  menuButtonIcon: {
    width: 46,
    height: 46,

    borderRadius: 13,

    backgroundColor: 'rgba(212, 183, 102, 0.12)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 15,
  },

  menuIcon: {
    color: GOLD,

    fontSize: 24,
    lineHeight: 27,

    fontWeight: '700',
  },

  /* TEXTO DEL MENÚ */

  menuButtonContent: {
    flex: 1,
  },

  menuButtonLabel: {
    color: '#FFFFFF',

    fontSize: 16,
    lineHeight: 21,

    fontWeight: '700',
  },

  menuButtonSubtitle: {
    color: '#A9A9A9',

    fontSize: 12,
    lineHeight: 17,

    marginTop: 3,
  },

  subtitleDanger: {
    color: DANGER,
  },

  subtitleActive: {
    color: GOLD,
  },

  menuChevron: {
    color: GOLD,

    fontSize: 28,
    lineHeight: 30,

    marginLeft: 10,
  },

  /* DRAWER */

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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

    backgroundColor: BLACK,

    borderRightWidth: 1,
    borderRightColor: GOLD,
  },

  drawerContent: {
    flex: 1,

    padding: 20,
  },

  /* PERFIL DEL DRAWER */

  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,

    marginBottom: 20,
  },

  drawerAvatar: {
    width: 50,
    height: 50,

    borderRadius: 25,

    borderWidth: 1.5,
    borderColor: GOLD,

    backgroundColor: BLACK_SOFT,

    alignItems: 'center',
    justifyContent: 'center',
  },

  drawerAvatarHead: {
    width: 13,
    height: 13,

    borderRadius: 7,

    borderWidth: 2,
    borderColor: GOLD,

    marginBottom: 3,
  },

  drawerAvatarBody: {
    width: 22,
    height: 11,

    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,

    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: GOLD,
  },

  drawerUserInfo: {
    flex: 1,
  },

  drawerWelcome: {
    color: '#AAAAAA',

    fontSize: 12,
    lineHeight: 16,
  },

  drawerName: {
    color: '#FFFFFF',

    fontSize: 18,
    lineHeight: 24,

    fontWeight: '700',
  },

  /* SEPARADOR */

  divider: {
    height: 1,

    backgroundColor: 'rgba(212, 183, 102, 0.35)',

    marginBottom: 8,
  },

  /* CAMPOS DEL DRAWER */

  drawerField: {
    paddingVertical: 12,
  },

  drawerFieldLabel: {
    color: GOLD,

    fontSize: 12,
    lineHeight: 16,
  },

  drawerFieldValue: {
    color: '#FFFFFF',

    fontSize: 14,
    lineHeight: 20,

    marginTop: 2,
  },

  drawerSpacer: {
    flex: 1,
  },

  /* CERRAR SESIÓN */

  signOutButton: {
    height: 46,

    borderRadius: 10,

    backgroundColor: '#C96B6B',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },

  signOutPressed: {
    opacity: 0.8,
  },

  signOutIcon: {
    color: '#FFFFFF',

    fontSize: 20,
    lineHeight: 22,
  },

  signOutText: {
    color: '#FFFFFF',

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '700',
  },
});