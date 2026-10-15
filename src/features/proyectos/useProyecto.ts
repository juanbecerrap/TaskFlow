import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import { db } from '../../lib/firebase'
import type { Proyecto } from '../../types/modelos'
import { mensajeErrorAuth } from '../auth/errores'
import { suscribirProyecto } from './servicioProyectos'

interface Estado {
  id: string
  proyecto: Proyecto | null
  error: string
  noEncontrado: boolean
}

interface ResultadoProyecto {
  proyecto: Proyecto | null
  cargando: boolean
  error: string
  noEncontrado: boolean
}

// Para las reglas, un proyecto ajeno y uno inexistente son lo mismo:
// ambos responden "permiso denegado" y se muestran como "no encontrado".
function esDenegado(error: Error) {
  return error instanceof FirebaseError && error.code === 'permission-denied'
}

export function useProyecto(id: string): ResultadoProyecto {
  const [estado, setEstado] = useState<Estado | null>(null)

  useEffect(() => {
    if (!id) return
    return suscribirProyecto(
      db,
      id,
      (proyecto) =>
        setEstado({ id, proyecto, error: '', noEncontrado: proyecto === null }),
      (error) =>
        setEstado({
          id,
          proyecto: null,
          error: esDenegado(error) ? '' : mensajeErrorAuth(error),
          noEncontrado: esDenegado(error),
        }),
    )
  }, [id])

  // Si cambia el id, el estado anterior no se reutiliza.
  const actual = estado && estado.id === id ? estado : null

  return {
    proyecto: actual?.proyecto ?? null,
    cargando: actual === null,
    error: actual?.error ?? '',
    noEncontrado: actual?.noEncontrado ?? false,
  }
}