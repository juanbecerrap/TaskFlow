import { createContext } from 'react'
import type { User } from 'firebase/auth'

export interface EstadoAuth {
  usuario: User | null
  cargando: boolean
}

export const ContextoAuth = createContext<EstadoAuth | null>(null)