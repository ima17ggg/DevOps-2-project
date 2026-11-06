import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import {
  getEmployeeSession,
  getExpressBaseUrl,
  setEmployeeSession,
} from '../services/rtlsClient'

export default function QrPassScreen() {
  const router = useRouter()
  const session = getEmployeeSession()
  const [qrImage, setQrImage] = useState<string | null>(session?.employee.qr_image ?? null)
  const [qrCode, setQrCode] = useState<string>(session?.employee.qr_code ?? '')
  const [regenerating, setRegenerating] = useState(false)

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay sesión activa.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.primaryBtnText}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleRegenerateQr = async () => {
    setRegenerating(true)
    try {
      const res = await fetch(
        `${getExpressBaseUrl()}/empleados/${session.employee.id_empleado}/qr/regenerar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
        }
      )
      const json = await res.json()
      if (!res.ok || !json?.success) {
        Alert.alert('Error', json?.error || 'No se pudo regenerar el QR')
        return
      }
      setQrImage(json.data.qr_image)
      if (json.data.qr_code) setQrCode(json.data.qr_code)
      setEmployeeSession({
        ...session,
        employee: {
          ...session.employee,
          qr_image: json.data.qr_image,
          qr_code: json.data.qr_code || qrCode,
        },
      })
    } catch {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor Express')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.roleTag}>{session.employee.role.toUpperCase()}</Text>
        <Text style={styles.name}>{session.employee.name}</Text>
        <Text style={styles.plant}>{session.employee.plant}</Text>

        <View style={styles.qrBox}>
          {qrImage ? (
            <Image source={{ uri: qrImage }} style={styles.qrImage} contentFit="contain" />
          ) : (
            <Text style={styles.emptyText}>Sin imagen QR disponible</Text>
          )}
        </View>

        <Text style={styles.codeLabel}>{qrCode}</Text>
        <Text style={styles.hint}>
          Muestra este código QR en el escáner de entrada y luego activa tu rastreo RTLS.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/tracker')}
        >
          <Text style={styles.primaryBtnText}>Iniciar Rastreo RTLS (GPS + WebSocket)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleRegenerateQr}
          disabled={regenerating}
        >
          {regenerating ? (
            <ActivityIndicator color="#041632" />
          ) : (
            <Text style={styles.secondaryBtnText}>Actualizar QR del Día</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    padding: 20,
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  roleTag: {
    backgroundColor: '#fff3e0',
    color: '#fc820c',
    fontWeight: '800',
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#041632',
    textAlign: 'center',
  },
  plant: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 2,
    marginBottom: 18,
  },
  qrBox: {
    width: 230,
    height: 230,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e8eaed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
  },
  qrImage: {
    width: 205,
    height: 205,
  },
  codeLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#5f6368',
    marginTop: 10,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  primaryBtn: {
    backgroundColor: '#fc820c',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#041632',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#041632',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 12,
  },
})
