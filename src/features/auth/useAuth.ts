import { useContext } from 'react'
import { ContextoAuth, type EstadoAuth } from './contextoAuth'

export function useAuth(): EstadoAuth {
  const estado = useContext(ContextoAuth)
  if (!estado) {
    throw new Error('useAuth debe usarse dentro de ProveedorAuth')
  }
  return estado
}