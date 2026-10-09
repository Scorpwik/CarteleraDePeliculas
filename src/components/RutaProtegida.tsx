import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RutaProtegida() {
  const { session, cargando } = useAuth()

  if (cargando) {
    return <p className="mensaje-estado">Cargando sesión…</p>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
