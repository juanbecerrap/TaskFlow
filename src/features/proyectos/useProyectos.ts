import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import type { Proyecto } from '../../types/modelos'
import { mensajeErrorAuth } from '../auth/errores'
import { useAuth } from '../auth/useAuth'
import { suscribirProyectos } from './servicioProyectos'

interface EstadoProyectos {
  proyectos: Proyecto[]
  cargando: boolean
  error: string
}

export function useProyectos(): EstadoProyectos {
  const { usuario } = useAuth()
  const uid = usuario?.uid
  const [estado, setEstado] = useState<EstadoProyectos>({
    proyectos: [],
    cargando: true,
    error: '',
  })

  useEffect(() => {
    if (!uid) return
    return suscribirProyectos(
      db,
      uid,
      (proyectos) => setEstado({ proyectos, cargando: false, error: '' }),
      (error) =>
        setEstado({ proyectos: [], cargando: false, error: mensajeErrorAuth(error) }),
    )
  }, [uid])

  return estado
}