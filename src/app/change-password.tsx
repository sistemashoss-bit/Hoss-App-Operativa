import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const BLACK = '#0D0D0D';
const GOLD = '#D4B766';
const GOLD_BUTTON = '#B89232';
const BACKGROUND = '#F1EEE8';
const TEXT = '#171717';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (next.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (next !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'No se pudo cambiar la contraseña');
      }
      setOk(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo cambiar la contraseña',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = submitting || !current || !next || !confirm;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* NAVBAR */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText style={styles.back}>‹ Volver</ThemedText>
          </Pressable>
          <ThemedText style={styles.topTitle}>Cambiar contraseña</ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          {ok ? (
            <View style={styles.card}>
              <ThemedText style={styles.successTitle}>
                Contraseña actualizada
              </ThemedText>
              <ThemedText style={styles.successText}>
                Tu contraseña se cambió correctamente.
              </ThemedText>
              <Pressable
                style={styles.button}
                onPress={() => router.back()}
              >
                <ThemedText style={styles.buttonText}>VOLVER</ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.field}>
                <ThemedText style={styles.label}>Contraseña actual</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Tu contraseña actual"
                  placeholderTextColor="#A7A198"
                  secureTextEntry
                  value={current}
                  onChangeText={setCurrent}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={styles.label}>Nueva contraseña</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#A7A198"
                  secureTextEntry
                  value={next}
                  onChangeText={setNext}
                />
              </View>

              <View style={styles.field}>
                <ThemedText style={styles.label}>
                  Confirmar nueva contraseña
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor="#A7A198"
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>

              {error && <ThemedText style={styles.error}>{error}</ThemedText>}

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  disabled && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={disabled}
              >
                {submitting ? (
                  <ActivityIndicator color={BLACK} />
                ) : (
                  <ThemedText style={styles.buttonText}>
                    GUARDAR
                  </ThemedText>
                )}
              </Pressable>
            </View>
          )}
        </KeyboardAvoidingView>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  card: {
    backgroundColor: '#F8F5EE',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.14)',
    padding: 24,
  },
  field: { marginBottom: 18 },
  label: {
    color: '#655B45',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 7,
  },
  input: {
    height: 50,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: 'rgba(155, 116, 23, 0.38)',
    borderRadius: 8,
    color: TEXT,
    fontSize: 14,
    paddingHorizontal: 14,
  },
  error: { color: '#C65353', fontSize: 12, marginBottom: 8 },
  button: {
    height: 52,
    backgroundColor: GOLD_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B68A1F',
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#0D0D0D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  successTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: { color: '#655B45', fontSize: 14, marginBottom: 20 },
});
