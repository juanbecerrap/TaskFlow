import { useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { ContextoAuth, type EstadoAuth } from './contextoAuth'

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAuth>({
    usuario: null,
    cargando: true,
  })

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (usuario) => setEstado({ usuario, cargando: false }),
      () => setEstado({ usuario: null, cargando: false }),
    )
  }, [])

  return <ContextoAuth.Provider value={estado}>{children}</ContextoAuth.Provider>
}