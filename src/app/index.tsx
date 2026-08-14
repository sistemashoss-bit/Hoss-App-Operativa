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
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { user, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Redirect href="/menu" />;
  }

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/menu');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (

     <ImageBackground
      source={require('@/assets/images/login-bg.avif')}
      style={styles.background}
      resizeMode="cover"
    >
<View style={styles.overlay} />
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.form}>
            
<View style={styles.card}>
          <ThemedView style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/login-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </ThemedView>

          <ThemedText type="subtitle" style={styles.title}>
            INICIAR SESIÓN
          </ThemedText>
 
          <TextInput
           style={styles.input}
           placeholder="Correo electrónico"
           placeholderTextColor="#C4A85C"
           keyboardType="email-address"
           autoCapitalize="none"
           autoCorrect={false}
           value={email}
           onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#C4A85C"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error && (
            <ThemedText type="small" style={styles.error}>
              {error}
            </ThemedText>
          )}

         <Pressable
          style={[
            styles.button
          ]}
          onPress={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? (
            <ActivityIndicator color="#111111" />
          ) : (
            <ThemedText type="smallBold" style={styles.buttonText}>
              INICIAR SESIÓN
            </ThemedText>
          )}
        </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

   background: {
    flex: 1,
    backgroundColor: 'transparent',
  },

overlay: {
  ...StyleSheet.absoluteFill,
  backgroundColor: 'rgba(0, 0, 0, 0.30)',
},
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    width: '100%',
    maxWidth: MaxContentWidth / 2,

  },
  logoWrapper: {
    alignSelf: 'center',
     width: 96,
    height: 96,
    borderRadius: 48,

    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#C4A85C',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },
  logo: {
    height: 45,
    width: 82,
  },
  title: {
    textAlign: 'center',
    color: '#D4B766',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
    marginBottom: 40,
  },
  input: {
  height: 50,
  borderBottomWidth: 1,
  borderBottomColor: '#C4A85C',
  color: '#FFFFFF',
  fontSize: 15,
  paddingHorizontal: 6,
  marginBottom: 16,
  },
  error: {
    color: '#e5484d',
  },
  button: {
    height: 54,
     backgroundColor: '#D4B766',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 30,
  borderRadius: 2,
  },
  
  buttonText: {
   color: '#111111',
   fontSize: 13,
  fontWeight: '700',
  letterSpacing: 1.5,
  },

  card: {
  width: '100%',
  maxWidth: 320,
  alignSelf: 'center',

  paddingHorizontal: 20,
  paddingVertical: 24,

  backgroundColor: 'rgba(15, 15, 15, 0.35)',
  borderRadius: 12,
},


});
