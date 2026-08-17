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

/*
 * COLORES
 */

const GOLD = '#D4B766';
const GOLD_DARK = '#9B7417';
const BLACK = '#0D0D0D';

const BACKGROUND = '#F1EEE8';
const DRAWER_BACKGROUND = '#F5F1E8';

const DANGER = '#D77A7A';
const TEXT_MUTED = '#98938A';

const DRAWER_WIDTH = 300;

/*
 * ============================================
 * PREVIEW TEMPORAL
 * ============================================
 *
 * Cambia SOLO esta línea para visualizar:
 *
 * 'admin'
 * 'empleado'
 * 'instalador'
 */

type PreviewMenu =
  | 'admin'
  | 'empleado'
  | 'instalador';

const PREVIEW_MENU: PreviewMenu = 'instalador';

/*
 * TIPOS
 */

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

/*
 * ============================================
 * ADMIN
 * ============================================
 */

const ADMIN_OPTIONS: MenuOption[] = [
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

/*
 * ============================================
 * EMPLEADO SUCURSAL
 * ============================================
 */

const EMPLOYEE_OPTIONS: MenuOption[] = [
  {
    key: 'inventarios',
    label: 'Inventarios',
    subtitle: 'Consultar inventario',
    status: 'neutral',
  },
  {
    key: 'transferencias',
    label: 'Transferencias',
    subtitle: 'Transferencias activas',
    status: 'active',
  },
];

/*
 * ============================================
 * INSTALADOR
 * ============================================
 */

const INSTALLER_OPTIONS: MenuOption[] = [
  {
    key: 'instalaciones',
    label: 'Instalaciones',
    subtitle: 'Consultar instalaciones',
    status: 'neutral',
  },
];

/*
 * OPCIONES DEL PREVIEW
 */

const OPTIONS =
  PREVIEW_MENU === 'empleado'
    ? EMPLOYEE_OPTIONS
    : PREVIEW_MENU === 'instalador'
      ? INSTALLER_OPTIONS
      : ADMIN_OPTIONS;

/*
 * ============================================
 * COMPONENTE
 * ============================================
 */

export default function MenuScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const slideAnim = useRef(
    new Animated.Value(-DRAWER_WIDTH),
  ).current;

  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  /*
   * AUTH
   */

  if (!user) {
    return <Redirect href="/" />;
  }

  /*
   * ROL VISUAL TEMPORAL
   */

  const previewRole =
    PREVIEW_MENU === 'empleado'
      ? 'Empleado de sucursal'
      : PREVIEW_MENU === 'instalador'
        ? 'Instalador'
        : user.role;

  /*
   * DRAWER
   */

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

  /*
   * LOGOUT
   */

  async function handleSignOut() {
    closeDrawer();

    await signOut();

    router.replace('/');
  }

  /*
   * MÓDULO
   */

  function handleSelect(option: MenuOption) {
    console.log(`Seleccionado: ${option.key}`);

    /*
     * Sin navegación real todavía.
     */
  }

  /*
   * COLOR SUBTÍTULO
   */

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

  /*
   * ============================================
   * ICONOS
   * ============================================
   */

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

              <ThemedText
                style={styles.transferArrow}
              >
                ›
              </ThemedText>
            </View>

            <View
              style={styles.transferRowReverse}
            >
              <ThemedText
                style={styles.transferArrow}
              >
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
        {/* ===================================== */}
        {/* NAVBAR SUPERIOR */}
        {/* ===================================== */}

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
        </View>

        {/* ===================================== */}
        {/* CONTENIDO */}
        {/* ===================================== */}

        <View style={styles.content}>
          <View style={styles.operationsWrapper}>
            {/* TÍTULO */}

            <View style={styles.operationsHeader}>
              <ThemedText
                style={styles.operationsTitle}
              >
                OPERACIONES
              </ThemedText>

              <ThemedText
                style={
                  styles.operationsDescription
                }
              >
                Selecciona un módulo
              </ThemedText>
            </View>

            {/* LISTA */}

            <View
              style={[
                styles.operationsList,

                PREVIEW_MENU === 'empleado' &&
                  styles.employeeOperationsList,

                PREVIEW_MENU === 'instalador' &&
                  styles.installerOperationsList,
              ]}
            >
              {OPTIONS.map((option, index) => (
                <View key={option.key}>
                  <Pressable
                    onPress={() =>
                      handleSelect(option)
                    }
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

      {/* ===================================== */}
      {/* DRAWER */}
      {/* ===================================== */}

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
              {/* BRANDING */}

              <View style={styles.drawerBrand}>
                <ThemedText
                  style={styles.drawerBrandMain}
                >
                  HOSS
                </ThemedText>

                <ThemedText
                  style={styles.drawerBrandSub}
                >
                  MOBILE
                </ThemedText>
              </View>

              {/* PERFIL */}

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
                    style={styles.drawerName}
                  >
                    {user.first_name} {user.last_name}
                  </ThemedText>

                  <ThemedText
                    style={styles.drawerRole}
                  >
                    {previewRole}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.drawerDivider} />

              {/* CUENTA */}

              <ThemedText
                style={styles.drawerSectionLabel}
              >
                CUENTA
              </ThemedText>

              <View style={styles.drawerAccountInfo}>
                <ThemedText
                  style={styles.drawerInfoLabel}
                >
                  Correo
                </ThemedText>

                <ThemedText
                  style={styles.drawerEmail}
                  numberOfLines={2}
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

/*
 * ============================================
 * ESTILOS
 * ============================================
 */

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

    paddingHorizontal: 18,

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
   * CONTENIDO
   */

  content: {
    flex: 1,

    paddingHorizontal: 24,
  },

  operationsWrapper: {
    flex: 1,

    paddingTop: 36,
    paddingBottom: 40,
  },

  /*
   * HEADER
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
   * ADMIN
   */

  operationsList: {
    width: '100%',

    height: 430,

    justifyContent: 'space-between',
  },

  /*
   * EMPLEADO
   */

  employeeOperationsList: {
    height: 220,

    justifyContent: 'space-between',
  },

  /*
   * INSTALADOR
   */

  installerOperationsList: {
    height: 100,

    justifyContent: 'flex-start',
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
   * INVENTARIOS
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
      'rgba(0, 0, 0, 0.35)',
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

    backgroundColor:
      DRAWER_BACKGROUND,

    borderRightWidth: 1,
    borderRightColor:
      'rgba(155, 116, 23, 0.20)',

    shadowColor: '#000000',

    shadowOffset: {
      width: 4,
      height: 0,
    },

    shadowOpacity: 0.1,
    shadowRadius: 8,

    elevation: 8,
  },

  drawerContent: {
    flex: 1,

    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
  },

  /*
   * BRANDING DRAWER
   */

  drawerBrand: {
    marginBottom: 28,
  },

  drawerBrandMain: {
    color: '#171717',

    fontSize: 21,
    lineHeight: 22,

    fontWeight: '800',
    letterSpacing: 1.2,
  },

  drawerBrandSub: {
    color: GOLD_DARK,

    fontSize: 8,
    lineHeight: 10,

    fontWeight: '700',
    letterSpacing: 2.7,

    marginTop: 2,
  },

  /*
   * PERFIL DRAWER
   */

  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingBottom: 20,
  },

  drawerAvatar: {
    width: 52,
    height: 52,

    borderRadius: 26,

    borderWidth: 1.5,
    borderColor: '#B68A1F',

    backgroundColor: '#EEE6D3',

    alignItems: 'center',
    justifyContent: 'center',
  },

  drawerAvatarHead: {
    width: 13,
    height: 13,

    borderRadius: 7,

    borderWidth: 2,
    borderColor: GOLD_DARK,

    marginBottom: 3,
  },

  drawerAvatarBody: {
    width: 22,
    height: 11,

    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,

    borderWidth: 2,
    borderBottomWidth: 0,

    borderColor: GOLD_DARK,
  },

  drawerUserInfo: {
    flex: 1,

    marginLeft: 14,
  },

  drawerName: {
    color: '#171717',

    fontSize: 17,
    lineHeight: 22,

    fontWeight: '700',
  },

  drawerRole: {
    color: '#8A6818',

    fontSize: 12,
    lineHeight: 17,

    fontWeight: '700',

    marginTop: 3,
  },

  /*
   * DIVISOR
   */

  drawerDivider: {
    height: 1,

    backgroundColor:
      'rgba(155, 116, 23, 0.18)',

    marginBottom: 20,
  },

  /*
   * CUENTA
   */

  drawerSectionLabel: {
    color: '#777168',

    fontSize: 10,
    lineHeight: 14,

    fontWeight: '700',
    letterSpacing: 1.8,

    marginBottom: 12,
  },

  drawerAccountInfo: {
    paddingVertical: 4,
  },

  drawerInfoLabel: {
    color: '#8A6818',

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '700',

    marginBottom: 4,
  },

  drawerEmail: {
    color: '#4F4B44',

    fontSize: 12,
    lineHeight: 17,

    flexShrink: 1,
  },

  drawerSpacer: {
    flex: 1,
  },

  /*
   * CERRAR SESIÓN
   */

  signOutButton: {
    height: 48,

    borderRadius: 8,

    backgroundColor: '#C96B6B',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginHorizontal: 2,
    marginBottom: 4,

    gap: 8,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 2,
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