import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { getExpressBaseUrl, setEmployeeSession } from '../services/rtlsClient'

export default function LoginScreen() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [apiHost, setApiHost] = useState('localhost')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Campo requerido', 'Ingresa tu ID de empleado (ej. 1 o EMP-001)')
      return
    }

    setLoading(true)
    try {
      const baseUrl = getExpressBaseUrl(apiHost)
      const res = await fetch(`${baseUrl}/auth/employee-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })

      const json = await res.json()
      if (!res.ok || !json?.success) {
        Alert.alert('Error de acceso', json?.error || 'No se encontró el empleado')
        return
      }

      setEmployeeSession({
        token: json.data.token,
        apiHost: apiHost.trim() || 'localhost',
        employee: json.data.employee,
      })

      router.replace('/qr-pass')
    } catch (err: any) {
      Alert.alert(
        'Error de conexión',
        `No se pudo conectar a ${getExpressBaseUrl(apiHost)}.\npon la IP del servidor (ej. 192.168.1.50).`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.badge}>SISTEMA RTLS · PLANTA</Text>
        <Text style={styles.title}>Identificación de Empleado</Text>
        <Text style={styles.subtitle}>
          Inicia sesión en tu teléfono para generar tu código QR del día y activar tu localizador RTLS.
        </Text>

        <Text style={styles.label}>ID de Empleado o Código Externo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 1 o EMP-001"
          placeholderTextColor="#9aa0a6"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>IP del Servidor (PC)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 192.168.1.50 o localhost"
          placeholderTextColor="#9aa0a6"
          value={apiHost}
          onChangeText={setApiHost}
          autoCapitalize="none"
          keyboardType="url"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Entrar y Obtener QR</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badge: {
    color: '#fc820c',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#041632',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#5f6368',
    lineHeight: 19,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#041632',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#202124',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#041632',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
})
