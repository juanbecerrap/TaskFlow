import type { Timestamp } from 'firebase/firestore'

export const ESTADOS_PROYECTO = ['activo', 'archivado'] as const
export type EstadoProyecto = (typeof ESTADOS_PROYECTO)[number]

export const ESTADOS_TAREA = ['pendiente', 'en_progreso', 'completada'] as const
export type EstadoTarea = (typeof ESTADOS_TAREA)[number]

export const PRIORIDADES_TAREA = ['baja', 'media', 'alta'] as const
export type PrioridadTarea = (typeof PRIORIDADES_TAREA)[number]

export interface Perfil {
  nombre: string
  correo: string
  creadoEn: Timestamp
}

export interface Proyecto {
  id: string
  ownerId: string
  nombre: string
  descripcion: string
  estado: EstadoProyecto
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}

export interface Tarea {
  id: string
  ownerId: string
  projectId: string
  titulo: string
  descripcion: string
  estado: EstadoTarea
  prioridad: PrioridadTarea
  fechaLimite: Timestamp | null
  creadoEn: Timestamp
  actualizadoEn: Timestamp
}