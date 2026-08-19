import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import {
  Appointment,
  STATUS_META,
  formatDateTime,
} from '@/app/citas';

const GOLD = '#D4B766';
const BLACK = '#0D0D0D';
const BACKGROUND = '#F1EEE8';
const CARD = '#F8F5EE';
const TEXT = '#171717';
const TEXT_MUTED = '#8A857D';

const WAZE = '#33CCFF';
const GMAPS = '#1A73E8';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={styles.rowValue}>{value}</ThemedText>
    </View>
  );
}

export default function CitaDetailScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ id: string; data?: string }>();

  let appt: Appointment | null = null;
  try {
    appt = data ? (JSON.parse(data) as Appointment) : null;
  } catch {
    appt = null;
  }

  if (!appt) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ThemedText style={styles.back}>‹ Volver</ThemedText>
            </Pressable>
          </View>
          <View style={styles.center}>
            <ThemedText style={styles.muted}>Cita no disponible.</ThemedText>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const meta = STATUS_META[appt.status] ?? { label: appt.status, color: TEXT_MUTED };

  const lat = appt.latitude ? Number(appt.latitude) : null;
  const lng = appt.longitude ? Number(appt.longitude) : null;
  const hasCoords =
    lat != null && lng != null && !isNaN(lat) && !isNaN(lng);

  // La mayoría de las citas NO trae coordenadas, pero `address` es obligatorio.
  // Se navega por coords si existen (más preciso) y si no por texto de dirección
  // (+ CP para desambiguar). Waze y Google Maps aceptan ambos.
  const addressQuery = [appt.address, appt.postal_code]
    .filter(Boolean)
    .join(', ');
  const canNavigate = hasCoords || addressQuery.length > 0;

  function openWaze() {
    const url = hasCoords
      ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      : `https://waze.com/ul?q=${encodeURIComponent(addressQuery)}&navigate=yes`;
    Linking.openURL(url);
  }
  function openGoogleMaps() {
    const destination = hasCoords
      ? `${lat},${lng}`
      : encodeURIComponent(addressQuery);
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    );
  }
  function callPhone() {
    if (appt?.contact_phone) Linking.openURL(`tel:${appt.contact_phone}`);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText style={styles.back}>‹ Volver</ThemedText>
          </Pressable>
          <ThemedText style={styles.topTitle}>Detalle de cita</ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Encabezado */}
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <ThemedText style={styles.date}>
                {formatDateTime(appt.scheduled_date)}
              </ThemedText>
              <View style={[styles.badge, { backgroundColor: meta.color }]}>
                <ThemedText style={styles.badgeText}>{meta.label}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.customer}>
              {appt.customer_name ?? 'Sin cliente'}
            </ThemedText>
          </View>

          {/* Ubicación */}
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>UBICACIÓN</ThemedText>
            <Row label="Dirección" value={appt.address} />
            {appt.postal_code ? (
              <Row label="Código postal" value={appt.postal_code} />
            ) : null}
            {appt.branch_name ? (
              <Row label="Sucursal" value={appt.branch_name} />
            ) : null}

            {canNavigate ? (
              <>
                <View style={styles.navRow}>
                  <Pressable
                    style={[styles.navBtn, { backgroundColor: WAZE }]}
                    onPress={openWaze}
                  >
                    <ThemedText style={styles.navBtnText}>
                      Abrir en Waze
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.navBtn, { backgroundColor: GMAPS }]}
                    onPress={openGoogleMaps}
                  >
                    <ThemedText style={styles.navBtnTextLight}>
                      Google Maps
                    </ThemedText>
                  </Pressable>
                </View>
                {!hasCoords && (
                  <ThemedText style={styles.navHint}>
                    Navegación por dirección (sin coordenadas exactas).
                  </ThemedText>
                )}
              </>
            ) : (
              <ThemedText style={styles.noCoords}>
                Sin ubicación para navegación.
              </ThemedText>
            )}
          </View>

          {/* Contacto */}
          {appt.contact_phone ? (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>CONTACTO</ThemedText>
              <Pressable onPress={callPhone}>
                <Row label="Teléfono" value={appt.contact_phone} />
              </Pressable>
            </View>
          ) : null}

          {/* Servicios / items */}
          {appt.details.length > 0 ? (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>
                SERVICIOS / PRODUCTOS
              </ThemedText>
              {appt.details.map((d) => (
                <View key={d.id} style={styles.itemRow}>
                  <ThemedText style={styles.itemQty}>{d.quantity}×</ThemedText>
                  <ThemedText style={styles.itemName}>
                    {d.item_name ?? '—'}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Notas */}
          {appt.notes ? (
            <View style={styles.card}>
              <ThemedText style={styles.sectionTitle}>NOTAS</ThemedText>
              <ThemedText style={styles.notes}>{appt.notes}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
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
  back: { color: GOLD, fontSize: 15, fontWeight: '700', width: 60 },
  topTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: TEXT_MUTED },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.14)',
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: { color: '#655B45', fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  customer: { color: TEXT, fontSize: 18, fontWeight: '700' },
  sectionTitle: {
    color: '#8A857D',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  row: { marginBottom: 10 },
  rowLabel: { color: '#8A6818', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  rowValue: { color: TEXT, fontSize: 14 },
  navRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  navBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { color: '#0D0D0D', fontSize: 13, fontWeight: '800' },
  navBtnTextLight: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  noCoords: { color: TEXT_MUTED, fontSize: 12, marginTop: 4 },
  navHint: { color: TEXT_MUTED, fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  itemRow: { flexDirection: 'row', marginBottom: 8 },
  itemQty: { color: '#8A6818', fontSize: 14, fontWeight: '700', width: 34 },
  itemName: { color: TEXT, fontSize: 14, flex: 1 },
  notes: { color: '#4F4B44', fontSize: 14, lineHeight: 20 },
});
