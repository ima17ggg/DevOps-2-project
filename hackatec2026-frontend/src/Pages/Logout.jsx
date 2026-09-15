import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Logout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    logout().finally(() => {
      if (mounted) navigate('/login', { replace: true })
    })
    return () => { mounted = false }
  }, [logout, navigate])

  return null // o un spinner mientras cierra sesión
}