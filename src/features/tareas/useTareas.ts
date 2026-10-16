import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import type { Tarea } from '../../types/modelos'
import { mensajeErrorAuth } from '../auth/errores'
import { useAuth } from '../auth/useAuth'
import { suscribirTareas, suscribirTareasDeProyecto } from './servicioTareas'

interface Estado {
  clave: string
  tareas: Tarea[]
  error: string
}

interface ResultadoTareas {
  tareas: Tarea[]
  cargando: boolean
  error: string
}

// Sin projectId entrega todas las tareas del usuario; con projectId, solo las
// de ese proyecto.
export function useTareas(projectId?: string): ResultadoTareas {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const clave = uid ? `${uid}/${projectId ?? ''}` : ''
  const [estado, setEstado] = useState<Estado | null>(null)

  useEffect(() => {
    if (!uid) return
    const alRecibir = (tareas: Tarea[]) => setEstado({ clave, tareas, error: '' })
    const alFallar = (error: Error) =>
      setEstado({ clave, tareas: [], error: mensajeErrorAuth(error) })

    return projectId
      ? suscribirTareasDeProyecto(db, uid, projectId, alRecibir, alFallar)
      : suscribirTareas(db, uid, alRecibir, alFallar)
  }, [uid, projectId, clave])

  // Si cambia el proyecto, el estado anterior no se reutiliza.
  const actual = estado && estado.clave === clave ? estado : null

  return {
    tareas: actual?.tareas ?? [],
    cargando: actual === null,
    error: actual?.error ?? '',
  }
}