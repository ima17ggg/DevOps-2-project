import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  AppState,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  BACKGROUND_LOCATION_TASK,
  connectRtlsSocket,
  disconnectRtlsSocket,
  getEmployeeSession,
  pushLocationRealtime,
} from '../services/rtlsClient'

export default function TrackerScreen() {
  const router = useRouter()
  const session = getEmployeeSession()
  const watchSubRef = useRef<Location.LocationSubscription | null>(null)

  const [isTracking, setIsTracking] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  const [bgEnabled, setBgEnabled] = useState(false)
  const [coords, setCoords] = useState<{
    lat: number
    lng: number
    accuracy: number | null
    insideGeofence: boolean
    distanceMeters: number | null
    updatedAt: string
  } | null>(null)

  useEffect(() => {
    return () => {
      stopForegroundWatch()
      disconnectRtlsSocket()
    }
  }, [])

  useEffect(() => {
    if (!isTracking) return

    const sub = AppState.addEventListener('change', (nextState) => {
      if ((nextState === 'background' || nextState === 'inactive') && !bgEnabled) {
        disconnectRtlsSocket()
        setWsConnected(false)
      } else if (nextState === 'active') {
        connectRtlsSocket((connected) => setWsConnected(connected))
      }
    })

    return () => sub.remove()
  }, [isTracking, bgEnabled])

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Sesión expirada</Text>
        <TouchableOpacity style={styles.btnStart} onPress={() => router.replace('/login')}>
          <Text style={styles.btnText}>Volver al Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const stopForegroundWatch = () => {
    if (watchSubRef.current) {
      watchSubRef.current.remove()
      watchSubRef.current = null
    }
  }

  const startRtlsTracking = async () => {
    try {
      // 1. Permiso de ubicación en primer plano
      const fg = await Location.requestForegroundPermissionsAsync()
      if (fg.status !== 'granted') {
        Alert.alert('Permiso denegado', 'Debes permitir el acceso al GPS para usar el RTLS.')
        return
      }

      // 2. Conectar WebSocket Phoenix (:4000/socket)
      connectRtlsSocket((connected) => setWsConnected(connected))

      // 3. Suscripción GPS continua en primer plano (cada 2 segundos o cada 2 metros)
      stopForegroundWatch()
      watchSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        async (loc) => {
          const resp = await pushLocationRealtime(
            loc.coords.latitude,
            loc.coords.longitude,
            loc.coords.accuracy ?? null
          )

          setCoords({
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy ?? null,
            insideGeofence: resp?.inside_geofence ?? true,
            distanceMeters: resp?.distance_meters ?? null,
            updatedAt: new Date().toLocaleTimeString(),
          })
        }
      )

      setIsTracking(true)

      // 4. Activar tarea en segundo plano si el entorno nativo lo soporta
      // Nota: En Expo Go para iOS no se incluye el permiso nativo de Background Location en Info.plist,
      // por lo que capturamos el error para que el rastreo en primer plano siga funcionando sin fallar.
      if (Platform.OS !== 'web') {
        try {
          const bg = await Location.requestBackgroundPermissionsAsync()
          if (bg.status === 'granted') {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 3,
              showsBackgroundLocationIndicator: true,
              foregroundService: {
                notificationTitle: 'Rastreo RTLS Activo',
                notificationBody: 'Enviando tu ubicación en tiempo real a la planta.',
                notificationColor: '#041632',
              },
            })
            setBgEnabled(true)
          }
        } catch {
          // En Expo Go (iOS) el permiso en segundo plano no está habilitado en el binario de Expo Go;
          // el rastreo en primer plano (watchPositionAsync) continúa activo normalmente.
          setBgEnabled(false)
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Error de ubicación',
        err?.message || 'No se pudo iniciar el GPS. Verifica los permisos de ubicación en Ajustes.'
      )
    }
  }

  const stopRtlsTracking = async () => {
    stopForegroundWatch()
    disconnectRtlsSocket()
    setWsConnected(false)

    if (Platform.OS !== 'web') {
      try {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        if (hasStarted) {
          await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK)
        }
      } catch {
        // Ignorar si no estaba disponible en Expo Go
      }
    }

    setBgEnabled(false)
    setIsTracking(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isTracking ? (wsConnected ? '#1e8e3e' : '#f9ab00') : '#75777e' },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              !isTracking && { color: '#75777e' },
            ]}
          >
            {isTracking
              ? wsConnected
                ? 'Conectado a la planta (Tiempo Real)'
                : 'Transmitiendo tu ubicacion...'
              : 'Fuera de línea'}
          </Text>
        </View>

        <Text style={styles.title}>{session.employee.name}</Text>
        <Text style={styles.subtitle}>
          {session.employee.role} · {session.employee.plant}
        </Text>

        <View style={styles.metricsBox}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Latitud / Longitud:</Text>
            <Text style={styles.metricValue}>
              {coords ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : 'Esperando señal...'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Precisión GPS:</Text>
            <Text style={styles.metricValue}>
              {coords?.accuracy ? `±${Math.round(coords.accuracy)} m` : '—'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Estado Geocerca:</Text>
            <Text
              style={[
                styles.metricValue,
                { color: coords?.insideGeofence === false ? '#d93025' : '#1e8e3e' },
              ]}
            >
              {coords
                ? coords.insideGeofence
                  ? `Dentro de planta (${coords.distanceMeters ?? 0} m)`
                  : `Fuera de geocerca (${coords.distanceMeters ?? '?'} m)`
                : '—'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Segundo plano:</Text>
            <Text style={styles.metricValue}>
              {bgEnabled ? 'Activo (puedes minimizar la app)' : 'Solo en pantalla'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Último envío:</Text>
            <Text style={styles.metricValue}>{coords?.updatedAt || '—'}</Text>
          </View>
        </View>

        {!isTracking ? (
          <TouchableOpacity style={styles.btnStart} onPress={startRtlsTracking}>
            <Text style={styles.btnText}>Activar Transmisión RTLS</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnStop} onPress={stopRtlsTracking}>
            <Text style={styles.btnText}>Detener Rastreo (Fin de Turno)</Text>
          </TouchableOpacity>
        )}
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3c4043',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#041632',
  },
  subtitle: {
    fontSize: 13,
    color: '#5f6368',
    marginTop: 2,
    marginBottom: 18,
  },
  metricsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e8eaed',
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#5f6368',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 12,
    color: '#041632',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  btnStart: {
    backgroundColor: '#1e8e3e',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnStop: {
    backgroundColor: '#d93025',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
})
