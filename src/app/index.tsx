import { Image } from 'expo-image';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const GOLD = '#D4B766';
const GOLD_DARK = '#9B7417';
const BLACK = '#0D0D0D';
const GOLD_BUTTON = '#B89232';

const BACKGROUND = '#F1EEE8';
const CARD = '#F8F5EE';

const TEXT = '#171717';
const TEXT_MUTED = '#777168';

export default function LoginScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // app-de-hoss es solo para installers: tras el login siempre a sus citas.
  if (user) {
    return <Redirect href="/citas" />;
  }

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      await signIn(email.trim(), password);

      router.replace('/citas');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo iniciar sesión',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('@/assets/images/login-bg.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Hace que la imagen funcione más como textura */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
          style={styles.form}
        >
          <View style={styles.card}>
          
            {/* BRANDING */}
            <View style={styles.brandSection}>
              <View style={styles.brandRow}>
                <View style={styles.logoWrapper}>
                  <Image
                    source={require(
                      '@/assets/images/login-logo.png',
                    )}
                    style={styles.logo}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.brandText}>
                  <ThemedText style={styles.brandMain}>
                    HOSS
                  </ThemedText>

                  <ThemedText style={styles.brandSub}>
                    MOBILE
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* ENCABEZADO */}
            <View style={styles.heading}>
              <ThemedText style={styles.title}>
                Iniciar sesión
              </ThemedText>
            </View>

            {/* CORREO */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>
                Correo electrónico
              </ThemedText>

              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#A7A198"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* CONTRASEÑA */}
            <View style={styles.field}>
              <ThemedText style={styles.label}>
                Contraseña
              </ThemedText>

              <View style={styles.passwordWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor="#A7A198"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <ThemedText style={styles.passwordToggleText}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {/* ERROR */}
            {error && (
              <ThemedText style={styles.error}>
                {error}
              </ThemedText>
            )}

            {/* BOTÓN */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                (loading || !email || !password) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={
                loading || !email || !password
              }
            >
              {loading ? (
                <ActivityIndicator color={BLACK} />
              ) : (
                <ThemedText style={styles.buttonText}>
                  INICIAR SESIÓN
                </ThemedText>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  /*
   * ==========================================
   * FONDO
   * ==========================================
   */

  background: {
    flex: 1,
   width: '100%',
  height: '100%',
  backgroundColor: BACKGROUND,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
  backgroundColor: 'rgba(241, 238, 232, 0.72)',
  },

  safeArea: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: Spacing.four,
  },
  backgroundImage: {
  width: '100%',
  height: '100%',
},


  form: {
    width: '100%',
    maxWidth: MaxContentWidth / 2,
  },

  /*
   * ==========================================
   * TARJETA
   * ==========================================
   */

  card: {
    width: '100%',
    maxWidth: 340,

    alignSelf: 'center',

    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,

    backgroundColor: CARD,

    borderRadius: 12,

    borderWidth: 1,
    borderColor:
      'rgba(155, 116, 23, 0.14)',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 4,

    overflow: 'hidden',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoWrapper: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: BLACK,

    borderWidth: 1,
    borderColor: GOLD,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  logo: {
    width: 38,
    height: 23,
  },

  brandText: {
    justifyContent: 'center',
  },

  brandMain: {
    color: TEXT,

    fontSize: 21,
    lineHeight: 22,

    fontWeight: '800',
    letterSpacing: 1,
  },

  brandSub: {
    color: GOLD_DARK,

    fontSize: 8,
    lineHeight: 10,

    fontWeight: '700',
    letterSpacing: 2.6,

    marginTop: 2,
  },

  /*
   * ==========================================
   * ENCABEZADO
   * ==========================================
   */

  heading: {
    marginBottom: 26,
  },

  title: {
    color: TEXT,
  fontSize: 20,
  lineHeight: 30,

  fontWeight: '700',
  textAlign: 'center',
  },

  subtitle: {
    color: TEXT_MUTED,

    fontSize: 12,
    lineHeight: 18,

    marginTop: 4,
  },

  /*
   * ==========================================
   * CAMPOS
   * ==========================================
   */

  field: {
    marginBottom: 18,
  },

  label: {
    color: '#655B45',

    fontSize: 12,
    lineHeight: 16,

    fontWeight: '600',

    marginBottom: 7,
  },

  input: {
    height: 50,

    backgroundColor: '#FFFDF8',

    borderWidth: 1,
    borderColor:
      'rgba(155, 116, 23, 0.38)',

    borderRadius: 8,

    color: TEXT,

    fontSize: 14,

    paddingHorizontal: 14,
  },

  passwordWrap: {
    justifyContent: 'center',
  },

  passwordInput: {
    paddingRight: 80,
  },

  passwordToggle: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },

  passwordToggleText: {
    color: '#8A6818',
    fontSize: 13,
    fontWeight: '700',
  },

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  error: {
    color: '#C65353',

    fontSize: 12,
    lineHeight: 17,

    marginTop: -4,
    marginBottom: 8,
  },

  /*
   * ==========================================
   * BOTÓN
   * ==========================================
   */

  button: {
    height: 52,

    backgroundColor: GOLD_BUTTON,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 14,

    borderRadius: 8,

    borderWidth: 1,
    borderColor: '#B68A1F',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 3,
  },

  buttonPressed: {
    opacity: 0.85,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#0D0D0D',

    fontSize: 13,
    lineHeight: 18,

    fontWeight: '800',
    letterSpacing: 1.4,
  },
});