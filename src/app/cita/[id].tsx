import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';
import {
  Appointment,
  STATUS_META,
  formatDateTime,
} from '@/app/citas';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const GOLD = '#D4B766';
const BLACK = '#0D0D0D';
const BACKGROUND = '#F1EEE8';
const CARD = '#F8F5EE';
const TEXT = '#171717';
const TEXT_MUTED = '#8A857D';

const WAZE = '#33CCFF';
const GMAPS = '#1A73E8';

// Las 4 evidencias obligatorias (mismo orden/keys que el backend).
const EVIDENCE_TYPES = [
  { key: 'before', label: 'Foto de antes' },
  { key: 'after', label: 'Foto de después' },
  { key: 'delivery_format', label: 'Formato de entrega' },
  { key: 'clause_signature', label: 'Firma de cláusula' },
] as const;

type EvidenceItem = {
  type: string;
  uploaded: boolean;
  url: string | null;
  updated_at: string | null;
};
type EvidenceStatus = {
  items: EvidenceItem[];
  complete: boolean;
  missing: string[];
};

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
  const { user } = useAuth();

  let appt: Appointment | null = null;
  try {
    appt = data ? (JSON.parse(data) as Appointment) : null;
  } catch {
    appt = null;
  }
  const appointmentId = appt?.id;

  // Estado local (arranca del snapshot y se actualiza al iniciar/enviar a revisión).
  const [status, setStatus] = useState<string>(appt?.status ?? '');
  const [evidence, setEvidence] = useState<EvidenceStatus | null>(null);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadEvidence = useCallback(async () => {
    if (!appointmentId) return;
    try {
      const res = await fetch(
        `${API_URL}/serviceappointments/mine/${appointmentId}/evidence`,
        { headers: { Authorization: `Bearer ${user?.token}` } },
      );
      const json = await res.json();
      if (res.ok) setEvidence(json.data as EvidenceStatus);
    } catch {
      // silencioso: la sección muestra "sin subir" si no llega
    }
  }, [appointmentId, user?.token]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

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

  const meta = STATUS_META[status] ?? { label: status, color: TEXT_MUTED };

  const lat = appt.latitude ? Number(appt.latitude) : null;
  const lng = appt.longitude ? Number(appt.longitude) : null;
  const hasCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);

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

  // --- Estado / evidencias ---

  async function changeStatus(next: 'in_progress' | 'in_review') {
    if (!appointmentId) return;
    setBusy(true);
    try {
      const res = await fetch(
        `${API_URL}/serviceappointments/mine/${appointmentId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ status: next }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? 'No se pudo cambiar el estado');
      setStatus(next);
      if (next === 'in_review') {
        Alert.alert(
          'Enviada a revisión',
          'El staff revisará las evidencias y confirmará la instalación.',
        );
      }
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'No se pudo cambiar el estado',
      );
    } finally {
      setBusy(false);
    }
  }

  async function pickImage(source: 'camera' | 'library') {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permiso requerido', 'Habilita la cámara para la evidencia.');
        return null;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
      return res.canceled ? null : res.assets[0];
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Habilita el acceso a tus fotos.');
      return null;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    return res.canceled ? null : res.assets[0];
  }

  async function addEvidence(type: string, source: 'camera' | 'library') {
    if (!appointmentId) return;
    const asset = await pickImage(source);
    if (!asset) return;

    setUploadingType(type);
    try {
      // Subida nativa multipart: el `fetch` de Expo (winter) no acepta el objeto
      // { uri } de RN en FormData, así que se usa expo-file-system, que sube el
      // archivo local directamente. `fieldName`=photo y `parameters`=type casan
      // con multer (`upload.single('photo')` + req.body.type).
      const res = await FileSystem.uploadAsync(
        `${API_URL}/serviceappointments/mine/${appointmentId}/evidence`,
        asset.uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'photo',
          mimeType: asset.mimeType || 'image/jpeg',
          parameters: { type },
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (res.status < 200 || res.status >= 300) {
        let msg = 'No se pudo subir la foto';
        try {
          msg = JSON.parse(res.body)?.error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      await loadEvidence();
    } catch (e) {
      Alert.alert(
        'Error',
        e instanceof Error ? e.message : 'No se pudo subir la foto',
      );
    } finally {
      setUploadingType(null);
    }
  }

  const evByType = (type: string) =>
    evidence?.items.find((it) => it.type === type) ?? null;

  const isInProgress = status === 'in_progress';
  const showEvidence = ['in_progress', 'in_review', 'completed'].includes(status);
  const canStart = status === 'scheduled' || status === 'rescheduled';
  const allUploaded = Boolean(evidence?.complete);

  function renderSlot(type: string, label: string) {
    const item = evByType(type);
    const uploading = uploadingType === type;
    return (
      <View key={type} style={styles.slot}>
        <View style={styles.slotThumbWrap}>
          {item?.url ? (
            <Image
              source={{ uri: item.url }}
              style={styles.slotThumb}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.slotThumb, styles.slotThumbEmpty]}>
              <ThemedText style={styles.slotThumbEmptyText}>Sin foto</ThemedText>
            </View>
          )}
          {item?.uploaded && (
            <View style={styles.slotCheck}>
              <ThemedText style={styles.slotCheckText}>✓</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.slotBody}>
          <ThemedText style={styles.slotLabel}>{label}</ThemedText>
          {isInProgress ? (
            uploading ? (
              <ActivityIndicator color="#B68A1F" style={{ alignSelf: 'flex-start' }} />
            ) : (
              <View style={styles.slotActions}>
                <Pressable
                  style={styles.slotBtn}
                  onPress={() => addEvidence(type, 'camera')}
                >
                  <ThemedText style={styles.slotBtnText}>
                    {item?.uploaded ? 'Reemplazar' : 'Cámara'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={styles.slotBtnGhost}
                  onPress={() => addEvidence(type, 'library')}
                >
                  <ThemedText style={styles.slotBtnGhostText}>Galería</ThemedText>
                </Pressable>
              </View>
            )
          ) : (
            <ThemedText style={styles.slotStatusText}>
              {item?.uploaded ? 'Cargada' : 'Sin cargar'}
            </ThemedText>
          )}
        </View>
      </View>
    );
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

          {/* Estado / evidencias */}
          <View style={styles.card}>
            <ThemedText style={styles.sectionTitle}>INSTALACIÓN</ThemedText>

            {canStart && (
              <>
                <ThemedText style={styles.stateHint}>
                  Inicia la instalación para poder subir las evidencias.
                </ThemedText>
                <Pressable
                  style={[styles.primaryBtn, busy && styles.btnDisabled]}
                  onPress={() => changeStatus('in_progress')}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator color={BLACK} />
                  ) : (
                    <ThemedText style={styles.primaryBtnText}>
                      Iniciar instalación
                    </ThemedText>
                  )}
                </Pressable>
              </>
            )}

            {showEvidence && (
              <>
                <ThemedText style={styles.evidenceIntro}>
                  Evidencias {evidence ? `(${evidence.items.filter((i) => i.uploaded).length}/4)` : ''}
                </ThemedText>
                {EVIDENCE_TYPES.map((t) => renderSlot(t.key, t.label))}
              </>
            )}

            {isInProgress && (
              <>
                {!allUploaded && (
                  <ThemedText style={styles.stateHint}>
                    Sube las 4 evidencias para poder enviar a revisión.
                  </ThemedText>
                )}
                <Pressable
                  style={[
                    styles.primaryBtn,
                    (!allUploaded || busy) && styles.btnDisabled,
                  ]}
                  onPress={() => changeStatus('in_review')}
                  disabled={!allUploaded || busy}
                >
                  {busy ? (
                    <ActivityIndicator color={BLACK} />
                  ) : (
                    <ThemedText style={styles.primaryBtnText}>
                      Enviar a revisión
                    </ThemedText>
                  )}
                </Pressable>
              </>
            )}

            {status === 'in_review' && (
              <ThemedText style={styles.stateHint}>
                En revisión: el staff confirmará la instalación.
              </ThemedText>
            )}
            {status === 'completed' && (
              <ThemedText style={styles.stateOk}>
                Instalación completada.
              </ThemedText>
            )}
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

  // Estado / evidencias
  stateHint: { color: TEXT_MUTED, fontSize: 13, marginBottom: 12, lineHeight: 18 },
  stateOk: { color: '#2E9E5B', fontSize: 14, fontWeight: '700' },
  evidenceIntro: {
    color: '#655B45',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#B89232',
    borderWidth: 1,
    borderColor: '#B68A1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#0D0D0D',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.5 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(155, 116, 23, 0.12)',
  },
  slotThumbWrap: { width: 64, height: 64 },
  slotThumb: { width: 64, height: 64, borderRadius: 8 },
  slotThumbEmpty: {
    backgroundColor: '#EEE6D3',
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotThumbEmptyText: { color: '#9B8F78', fontSize: 10 },
  slotCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2E9E5B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotCheckText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  slotBody: { flex: 1 },
  slotLabel: { color: TEXT, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  slotStatusText: { color: TEXT_MUTED, fontSize: 12 },
  slotActions: { flexDirection: 'row', gap: 8 },
  slotBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#B89232',
  },
  slotBtnText: { color: '#0D0D0D', fontSize: 12, fontWeight: '800' },
  slotBtnGhost: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.45)',
  },
  slotBtnGhostText: { color: '#8A6818', fontSize: 12, fontWeight: '700' },
});
