import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const GOLD = '#D4B766';
const BLACK = '#0D0D0D';
const BACKGROUND = '#F1EEE8';

export default function RecepcionesScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.topBar}>
         <Pressable
            onPress={() => router.replace('/menu')}
            style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Volver al menú"
            >
            <ThemedText style={styles.backIcon}>
    ‹
  </ThemedText>
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

        <View style={styles.content}>
          <ThemedText style={styles.sectionLabel}>
            OPERACIONES
          </ThemedText>

          <ThemedText style={styles.title}>
            Transferencias
          </ThemedText>

          <ThemedText style={styles.description}>
            Gestión de traspasos entre sucursales
          </ThemedText>

          <View style={styles.divider} />

          <View style={styles.placeholder}>
            <ThemedText style={styles.placeholderText}>
              Contenido pendiente
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  topBar: {
    height: 72,
    backgroundColor: BLACK,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    elevation: 5,
  },

  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

backButtonPressed: {
  opacity: 0.55,
},

  backIcon: {
    color: GOLD,
    fontSize: 30,
    lineHeight: 31,
  },

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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 34,
  },

  sectionLabel: {
    color: '#9B7417',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },

  title: {
    color: '#171717',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 5,
  },

  description: {
    color: '#777168',
    fontSize: 13,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(155, 116, 23, 0.16)',
    marginTop: 24,
  },

  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    color: '#98938A',
    fontSize: 13,
  },
});