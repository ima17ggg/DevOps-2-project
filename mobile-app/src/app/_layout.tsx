import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#041632' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Acceso Empleado RTLS' }} />
        <Stack.Screen name="qr-pass" options={{ title: 'Mi Pase QR' }} />
        <Stack.Screen name="tracker" options={{ title: 'Rastreo RTLS en Vivo' }} />
      </Stack>
    </>
  )
}
