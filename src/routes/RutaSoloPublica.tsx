import { Navigate, Outlet, useLocation } from 'react-router'
import { PantallaCarga } from '../components/common/PantallaCarga'
import { useAuth } from '../features/auth/useAuth'
import { destinoSeguro } from './destinoSeguro'

export function RutaSoloPublica() {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <PantallaCarga />
  if (usuario) return <Navigate to={destinoSeguro(ubicacion.state)} replace />

  return <Outlet />
}