import { createContext, useEffect, useContext, useState } from 'react'

const AuthContext = createContext(null)

/**
 * Provee el estado de sesión a toda la app.
 * - La autenticación depende de la cookie HttpOnly emitida por el servidor.
 * - Solo se guarda metadata no sensible en memoria del navegador.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' })

        if (!res.ok) {
          return
        }

        const data = await res.json()
        const sessionUser = data?.data?.user ?? null

        if (isMounted && sessionUser) {
          setUser(sessionUser)
          setIsAuthenticated(true)
        }
      } catch {
        // No se pudo restaurar la sesión; se queda en estado anónimo.
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  /** Llama a esto cuando el usuario se autentique exitosamente. */
  const login = (authenticatedUser) => {
    setUser(authenticatedUser)
    setIsAuthenticated(true)
  }

  /** Llama a esto en el botón de cerrar sesión. */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isCheckingSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook para consumir el contexto fácilmente en cualquier componente */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
