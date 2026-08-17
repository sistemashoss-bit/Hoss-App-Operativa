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
const BLACK = '#0D0D0D';

const BACKGROUND = '#F1EEE8';

const DANGER = '#D77A7A';
const TEXT_MUTED = '#98938A';

const DRAWER_WIDTH = 300;

type MenuOption = {
  key:
    | 'recepciones'
    | 'transferencias'
    | 'inventarios'
    | 'instalaciones';

  label: string;
  subtitle: string;
  status?: 'danger' | 'active' | 'neutral';
};

const OPTIONS: MenuOption[] = [
  {
    key: 'recepciones',
    label: 'Recepciones',
    subtitle: '3 pendientes',
    status: 'danger',
  },
  {
    key: 'transferencias',
    label: 'Transferencias',
    subtitle: '5 activas',
    status: 'active',
  },
  {
    key: 'inventarios',
    label: 'Inventarios',
    subtitle: 'Consultar inventario',
    status: 'neutral',
  },
  {
    key: 'instalaciones',
    label: 'Instalaciones',
    subtitle: '4 pendientes',
    status: 'danger',
  },
];

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const slideAnim = useRef(
    new Animated.Value(-DRAWER_WIDTH),
  ).current;

  const fadeAnim = useRef(
    new Animated.Value(0),
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

  function getSubtitleColor(
    status?: MenuOption['status'],
  ) {
    switch (status) {
      case 'danger':
        return DANGER;

      case 'active':
        return '#B68A1F';

      default:
        return TEXT_MUTED;
    }
  }

  function renderOperationIcon(
    key: MenuOption['key'],
  ) {
    switch (key) {
      case 'recepciones':
        return (
          <View style={styles.boxIcon}>
            <View style={styles.boxTop} />
            <View style={styles.boxBody} />
          </View>
        );

      case 'transferencias':
        return (
          <View style={styles.transferIcon}>
            <View style={styles.transferRow}>
              <View style={styles.transferLine} />

              <ThemedText style={styles.transferArrow}>
                ›
              </ThemedText>
            </View>

            <View style={styles.transferRowReverse}>
              <ThemedText style={styles.transferArrow}>
                ‹
              </ThemedText>

              <View style={styles.transferLine} />
            </View>
          </View>
        );

      case 'inventarios':
        return (
          <View style={styles.inventoryIcon}>
            <View style={styles.inventoryRow}>
              <View style={styles.inventoryDot} />
              <View style={styles.inventoryLine} />
            </View>

            <View style={styles.inventoryRow}>
              <View style={styles.inventoryDot} />
              <View style={styles.inventoryLine} />
            </View>

            <View style={styles.inventoryRow}>
              <View style={styles.inventoryDot} />
              <View style={styles.inventoryLine} />
            </View>
          </View>
        );

      case 'instalaciones':
        return (
          <View style={styles.toolIcon}>
            <View style={styles.toolHead} />
            <View style={styles.toolHandle} />
          </View>
        );

      default:
        return null;
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        {/* NAVBAR */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Pressable
              onPress={openDrawer}
              hitSlop={12}
              style={styles.hamburger}
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
            >
              <View
                style={[
                  styles.hamburgerLine,
                  { width: 24 },
                ]}
              />

              <View
                style={[
                  styles.hamburgerLine,
                  { width: 18 },
                ]}
              />

              <View
                style={[
                  styles.hamburgerLine,
                  { width: 24 },
                ]}
              />
            </Pressable>

            <View style={styles.brandContainer}>
              <ThemedText style={styles.brandMain}>
                HOSS
              </ThemedText>

              <ThemedText style={styles.brandSub}>
                MOBILE
              </ThemedText>
            </View>
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
          <View style={styles.operationsWrapper}>
            {/* TÍTULO */}
            <View style={styles.operationsHeader}>
              <ThemedText style={styles.operationsTitle}>
                OPERACIONES
              </ThemedText>

              <ThemedText
                style={styles.operationsDescription}
              >
                Selecciona un módulo
              </ThemedText>
            </View>

            {/* MÓDULOS */}
            <View style={styles.operationsList}>
              {OPTIONS.map((option, index) => (
                <View key={option.key}>
                  <Pressable
                    onPress={() => handleSelect(option)}
                    style={({ pressed }) => [
                      styles.operationRow,
                      pressed &&
                        styles.operationRowPressed,
                    ]}
                  >
                    {/* ICONO */}
                    <View style={styles.operationIcon}>
                      {renderOperationIcon(option.key)}
                    </View>

                    {/* TEXTO */}
                    <View style={styles.operationContent}>
                      <ThemedText
                        style={styles.operationLabel}
                      >
                        {option.label}
                      </ThemedText>

                      <ThemedText
                        style={[
                          styles.operationSubtitle,
                          {
                            color: getSubtitleColor(
                              option.status,
                            ),
                          },
                        ]}
                      >
                        {option.subtitle}
                      </ThemedText>
                    </View>

                    {/* FLECHA */}
                    <View
                      style={
                        styles.operationArrowContainer
                      }
                    >
                      <ThemedText
                        style={styles.operationArrow}
                      >
                        ›
                      </ThemedText>
                    </View>
                  </Pressable>

                  {index < OPTIONS.length - 1 && (
                    <View
                      style={styles.operationDivider}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* DRAWER */}
      <Modal
        visible={drawerOpen}
        transparent
        animationType="none"
        onRequestClose={closeDrawer}
      >
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
              {/* USUARIO */}
              <View style={styles.drawerProfile}>
                <View style={styles.drawerAvatar}>
                  <View
                    style={styles.drawerAvatarHead}
                  />
                  <View
                    style={styles.drawerAvatarBody}
                  />
                </View>

                <View style={styles.drawerUserInfo}>
                  <ThemedText
                    style={styles.drawerWelcome}
                  >
                    Bienvenido
                  </ThemedText>

                  <ThemedText
                    style={styles.drawerName}
                  >
                    {user.first_name} {user.last_name}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.drawerDivider} />

              {/* ROL */}
              <View style={styles.drawerField}>
                <ThemedText
                  style={styles.drawerFieldLabel}
                >
                  Rol
                </ThemedText>

                <ThemedText
                  style={styles.drawerFieldValue}
                >
                  {user.role}
                </ThemedText>
              </View>

              {/* CORREO */}
              <View style={styles.drawerField}>
                <ThemedText
                  style={styles.drawerFieldLabel}
                >
                  Correo
                </ThemedText>

                <ThemedText
                  style={styles.drawerFieldValue}
                >
                  {user.email}
                </ThemedText>
              </View>

              <View style={styles.drawerSpacer} />

              {/* CERRAR SESIÓN */}
              <Pressable
                style={({ pressed }) => [
                  styles.signOutButton,
                  pressed &&
                    styles.signOutPressed,
                ]}
                onPress={handleSignOut}
              >
                <ThemedText
                  style={styles.signOutIcon}
                >
                  ↪
                </ThemedText>

                <ThemedText
                  style={styles.signOutText}
                >
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
  /*
   * GENERAL
   */

  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  /*
   * NAVBAR
   */

  topBar: {
    height: 72,

    backgroundColor: BLACK,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 18,

    borderBottomWidth: 2,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,

    elevation: 5,
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  /*
   * HAMBURGUESA
   */

  hamburger: {
    width: 25,
    height: 20,
    justifyContent: 'space-between',
  },

  hamburgerLine: {
    height: 2,
    borderRadius: 2,
    backgroundColor: GOLD,
  },

  /*
   * BRANDING
   */

  brandContainer: {
    justifyContent: 'center',
  },

  brandMain: {
    color: '#FFFFFF',

    fontSize: 19,
    lineHeight: 20,

    fontWeight: '800',
    letterSpacing: 1,
  },

  brandSub: {
    color: GOLD,

    fontSize: 8,
    lineHeight: 10,

    fontWeight: '700',
    letterSpacing: 2.5,

    marginTop: 2,
  },

  /*
   * PERFIL
   */

  profileButton: {
    width: 40,
    height: 40,

    borderRadius: 20,

    borderWidth: 1.5,
    borderColor: GOLD,

    backgroundColor: '#181713',

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileHead: {
    width: 10,
    height: 10,

    borderRadius: 5,

    borderWidth: 2,
    borderColor: GOLD,

    marginBottom: 2,
  },

  profileBody: {
    width: 17,
    height: 9,

    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,

    borderWidth: 2,
    borderBottomWidth: 0,

    borderColor: GOLD,
  },

  /*
   * CONTENIDO
   */

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  /*
   * AQUÍ ESTÁ EL CAMBIO IMPORTANTE
   */

  operationsWrapper: {
    flex: 1,

    paddingTop: 36,
    paddingBottom: 40,
  },

  /*
   * ENCABEZADO
   */

  operationsHeader: {
    marginBottom: 24,
  },

  operationsTitle: {
    color: '#171717',

    fontSize: 14,
    lineHeight: 19,

    fontWeight: '800',
    letterSpacing: 2,
  },

  operationsDescription: {
    color: '#8A857D',

    fontSize: 12,
    lineHeight: 17,

    marginTop: 5,
  },

  /*
   * LISTA
   */

  operationsList: {
     width: '100%',
    height: 430,
  justifyContent: 'space-between',
  },

  /*
   * FILAS
   */

  operationRow: {
    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 4,
    paddingVertical: 12,

    backgroundColor: 'transparent',
  },

  operationRowPressed: {
    opacity: 0.55,
  },

  operationDivider: {
    height: 1,

    marginLeft: 48,
    marginRight: 2,

    backgroundColor:
      'rgba(155, 116, 23, 0.16)',
  },

  /*
   * ICONOS
   */

  operationIcon: {
    width: 34,
    height: 34,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  /*
   * RECEPCIONES
   */

  boxIcon: {
    width: 25,
    height: 24,

    alignItems: 'center',
  },

  boxTop: {
    width: 20,
    height: 7,

    borderWidth: 2,
    borderColor: GOLD,

    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  boxBody: {
    width: 22,
    height: 16,

    borderWidth: 2,
    borderTopWidth: 0,

    borderColor: GOLD,

    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  /*
   * TRANSFERENCIAS
   */

  transferIcon: {
    width: 26,
    gap: 1,
  },

  transferRow: {
    height: 10,

    flexDirection: 'row',
    alignItems: 'center',
  },

  transferRowReverse: {
    height: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  transferLine: {
    width: 17,
    height: 2,

    borderRadius: 2,

    backgroundColor: GOLD,
  },

  transferArrow: {
    color: GOLD,

    fontSize: 18,
    lineHeight: 18,

    fontWeight: '700',
  },

  /*
   * INVENTARIO
   */

  inventoryIcon: {
    width: 27,
    gap: 4,
  },

  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  inventoryDot: {
    width: 4,
    height: 4,

    borderRadius: 1,

    backgroundColor: GOLD,
  },

  inventoryLine: {
    flex: 1,

    height: 2,

    borderRadius: 2,

    backgroundColor: GOLD,
  },

  /*
   * INSTALACIONES
   */

  toolIcon: {
    width: 25,
    height: 27,

    alignItems: 'center',
    justifyContent: 'center',

    transform: [
      {
        rotate: '-45deg',
      },
    ],
  },

  toolHead: {
    width: 13,
    height: 13,

    borderWidth: 2,
    borderColor: GOLD,

    borderRadius: 3,
  },

  toolHandle: {
    width: 4,
    height: 14,

    marginTop: -1,

    borderRadius: 2,

    backgroundColor: GOLD,
  },

  /*
   * TEXTO
   */

  operationContent: {
    flex: 1,
  },

  operationLabel: {
    color: '#171717',

    fontSize: 16,
    lineHeight: 21,

    fontWeight: '700',
  },

  operationSubtitle: {
    fontSize: 12,
    lineHeight: 17,

    marginTop: 3,
  },

  /*
   * FLECHA
   */

  operationArrowContainer: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',
  },

  operationArrow: {
    color: '#B68A1F',

    fontSize: 25,
    lineHeight: 27,

    fontWeight: '400',
  },

  /*
   * DRAWER
   */

  backdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      'rgba(0, 0, 0, 0.55)',
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

    backgroundColor: '#171717',

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

  drawerDivider: {
    height: 1,

    backgroundColor:
      'rgba(212, 183, 102, 0.35)',

    marginBottom: 8,
  },

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

  /*
   * CERRAR SESIÓN
   */

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