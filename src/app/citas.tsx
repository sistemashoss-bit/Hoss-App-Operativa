import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const GOLD = '#D4B766';
const BLACK = '#0D0D0D';
const BACKGROUND = '#F1EEE8';
const CARD = '#F8F5EE';
const TEXT = '#171717';
const TEXT_MUTED = '#8A857D';

export type Appointment = {
  id: number;
  scheduled_date: string;
  status: string;
  address: string;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  contact_phone: string | null;
  notes: string | null;
  completion_notes: string | null;
  branch_name: string | null;
  customer_name: string | null;
  items: string[];
  sale_id: number | null;
  sale_custom_id: string | null;
  details: { id: number; quantity: number; item_name: string | null; item_type: string }[];
};

export const STATUS_META: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Programada', color: '#3B82F6' },
  in_progress: { label: 'En progreso', color: '#B68A1F' },
  in_review: { label: 'En revisión', color: '#7A5CC0' },
  completed: { label: 'Completada', color: '#2E9E5B' },
  cancelled: { label: 'Cancelada', color: '#C65353' },
  rescheduled: { label: 'Reprogramada', color: '#D08A3E' },
};

// Opciones del filtro por estado: "Todas" + cada estado conocido.
const STATUS_FILTERS: { key: string | null; label: string; color: string }[] = [
  { key: null, label: 'Todas', color: '#8A6818' },
  ...Object.entries(STATUS_META).map(([key, m]) => ({
    key,
    label: m.label,
    color: m.color,
  })),
];

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  h = h % 12 || 12;
  return `${dd}/${mm}/${yy} · ${h}:${min} ${ampm}`;
}

export default function CitasScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/serviceappointments/mine`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudieron cargar las citas');
      }
      setItems((data?.data ?? []) as Appointment[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  useEffect(() => {
    load();
  }, [load]);

  // Guard: esta pantalla es solo para el flujo autenticado.
  if (!user) {
    return <Redirect href="/" />;
  }

  const visible = statusFilter
    ? items.filter((it) => it.status === statusFilter)
    : items;

  function openDetail(item: Appointment) {
    router.push({
      pathname: '/cita/[id]',
      params: { id: String(item.id), data: JSON.stringify(item) },
    });
  }

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    router.replace('/');
  }

  function renderItem({ item }: { item: Appointment }) {
    const meta = STATUS_META[item.status] ?? {
      label: item.status,
      color: TEXT_MUTED,
    };
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => openDetail(item)}
      >
        <View style={styles.cardHeader}>
          <ThemedText style={styles.cardDate}>
            {formatDateTime(item.scheduled_date)}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: meta.color }]}>
            <ThemedText style={styles.badgeText}>{meta.label}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.cardCustomer}>
          {item.customer_name ?? 'Sin cliente'}
        </ThemedText>

        {item.items.length > 0 && (
          <ThemedText style={styles.cardItems} numberOfLines={2}>
            {item.items.join(', ')}
          </ThemedText>
        )}

        <ThemedText style={styles.cardAddress} numberOfLines={1}>
          {item.address}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* NAVBAR */}
        <View style={styles.topBar}>
          <ThemedText style={styles.brandMain}>MIS CITAS</ThemedText>

          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={12}
            style={styles.avatar}
            accessibilityLabel="Cuenta"
          >
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </Pressable>
        </View>

        {/* CONTENIDO */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#B68A1F" />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ThemedText style={styles.error}>{error}</ThemedText>
            <Pressable style={styles.retry} onPress={load}>
              <ThemedText style={styles.retryText}>Reintentar</ThemedText>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <ThemedText style={styles.empty}>No tienes citas asignadas.</ThemedText>
          </View>
        ) : (
          <>
            {/* FILTRO POR ESTADO */}
            <View style={styles.filterWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {STATUS_FILTERS.map((f) => {
                  const active = statusFilter === f.key;
                  return (
                    <Pressable
                      key={f.label}
                      onPress={() => setStatusFilter(f.key)}
                      style={[
                        styles.chip,
                        active && { backgroundColor: f.color, borderColor: f.color },
                      ]}
                    >
                      <ThemedText
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {f.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {visible.length === 0 ? (
              <View style={styles.center}>
                <ThemedText style={styles.empty}>
                  No hay citas con este estado.
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={visible}
                keyExtractor={(it) => String(it.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      load();
                    }}
                  />
                }
              />
            )}
          </>
        )}
      </SafeAreaView>

      {/* MENÚ DE CUENTA */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        <View style={styles.sheet}>
          <ThemedText style={styles.sheetName}>
            {user.first_name} {user.last_name}
          </ThemedText>
          <ThemedText style={styles.sheetEmail}>{user.email}</ThemedText>

          <Pressable
            style={styles.sheetItem}
            onPress={() => {
              setMenuOpen(false);
              router.push('/change-password');
            }}
          >
            <ThemedText style={styles.sheetItemText}>
              Cambiar contraseña
            </ThemedText>
          </Pressable>

          <Pressable style={styles.sheetSignOut} onPress={handleSignOut}>
            <ThemedText style={styles.sheetSignOutText}>Cerrar sesión</ThemedText>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  topBar: {
    height: 72,
    backgroundColor: BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  brandMain: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: GOLD,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHead: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    marginBottom: 2,
  },
  avatarBody: {
    width: 18,
    height: 9,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: GOLD,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#C65353', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  empty: { color: TEXT_MUTED, fontSize: 14 },
  retry: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B68A1F',
  },
  retryText: { color: '#8A6818', fontWeight: '700' },
  filterWrap: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 116, 23, 0.14)',
  },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.4)',
    backgroundColor: 'transparent',
  },
  chipText: { color: '#8A6818', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#FFFFFF' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.14)',
    padding: 16,
  },
  cardPressed: { opacity: 0.7 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardDate: { color: '#655B45', fontSize: 13, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  cardCustomer: { color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardItems: { color: TEXT_MUTED, fontSize: 13, marginBottom: 4 },
  cardAddress: { color: '#9B8F78', fontSize: 12 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 240,
    backgroundColor: '#F5F1E8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.2)',
    padding: 16,
  },
  sheetName: { color: TEXT, fontSize: 15, fontWeight: '700' },
  sheetEmail: { color: TEXT_MUTED, fontSize: 12, marginBottom: 14 },
  sheetItem: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 116, 23, 0.15)',
  },
  sheetItemText: { color: '#8A6818', fontSize: 14, fontWeight: '700' },
  sheetSignOut: {
    marginTop: 10,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#C96B6B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSignOutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
