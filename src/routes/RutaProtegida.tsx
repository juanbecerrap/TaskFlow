import { Navigate, Outlet, useLocation } from 'react-router'
import { PantallaCarga } from '../components/common/PantallaCarga'
import { useAuth } from '../features/auth/useAuth'
import { RUTAS } from './rutas'

export function RutaProtegida() {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <PantallaCarga />

  if (!usuario) {
    return (
      <Navigate
        to={RUTAS.iniciarSesion}
        replace
        state={{ desde: `${ubicacion.pathname}${ubicacion.search}` }}
      />
    )
  }

  return <Outlet />
}