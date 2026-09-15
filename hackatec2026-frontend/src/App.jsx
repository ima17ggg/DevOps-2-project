import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import GeoTrackerBridge from './components/GeoTrackerBridge'
import SideNavBar from './components/SideNavBar'
import TopNavBar from './components/TopNavBar'
import Login from './Pages/login'
import Logout from './Pages/Logout'
import Attendance from './Pages/Attendance'
import CheckIn  from './Pages/CheckIn'
import Checkout from './Pages/Checkout'
import Dashboard from './Pages/Dashboard'
import Employees from './Pages/Employees'
import Reports from './Pages/Reportes'
import QRGenerate from './Pages/QRGenerate'
import NotificationSettings from './Pages/NotificationSettings'

/** Layout con sidebar + topnav — solo se muestra a usuarios autenticados */
function AppLayout() {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex">
      <SideNavBar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        <TopNavBar />
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      {/* Rastreador GPS global — invisible, corre en background */}
      <GeoTrackerBridge />
      <Routes>
        {/* Ruta pública: login (sin sidebar ni topnav) */}
        <Route path="/login" element={<Login />} />
        <Route path="/chekin"  element={<Attendance />} />
        <Route path="/checkin"  element={<CheckIn />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/logout"  element={<Logout />} />

        {/* Rutas protegidas: requieren sesión activa */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/employees"   element={<Employees />} />
            <Route path="/reports"     element={<Reports />} />
            <Route path="/qr-generate"    element={<QRGenerate />} />
            <Route path="/notifications"  element={<NotificationSettings />} />
          </Route>
        </Route>

        {/* Cualquier ruta desconocida → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
