import { normalizarTexto } from '../../lib/texto'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types/modelos'

export type FiltroEstadoTarea = EstadoTarea | 'todos'
export type FiltroPrioridad = PrioridadTarea | 'todas'
export type OrdenTareas = 'reciente' | 'fecha' | 'prioridad'

export interface FiltrosTareas {
  texto: string
  estado: FiltroEstadoTarea
  prioridad: FiltroPrioridad
  orden: OrdenTareas
}

export const FILTROS_TAREAS_INICIALES: FiltrosTareas = {
  texto: '',
  estado: 'todos',
  prioridad: 'todas',
  orden: 'reciente',
}

const PESO_PRIORIDAD: Record<PrioridadTarea, number> = { alta: 3, media: 2, baja: 1 }

function porReciente(a: Tarea, b: Tarea) {
  return b.actualizadoEn.toMillis() - a.actualizadoEn.toMillis()
}

// Fecha límite más cercana primero; las tareas sin fecha van al final.
function porFecha(a: Tarea, b: Tarea) {
  const fechaA = a.fechaLimite?.toMillis() ?? Infinity
  const fechaB = b.fechaLimite?.toMillis() ?? Infinity
  if (fechaA === fechaB) return porReciente(a, b)
  return fechaA < fechaB ? -1 : 1
}

function porPrioridad(a: Tarea, b: Tarea) {
  const diferencia = PESO_PRIORIDAD[b.prioridad] - PESO_PRIORIDAD[a.prioridad]
  return diferencia !== 0 ? diferencia : porFecha(a, b)
}

const COMPARADORES: Record<OrdenTareas, (a: Tarea, b: Tarea) => number> = {
  reciente: porReciente,
  fecha: porFecha,
  prioridad: porPrioridad,
}

export function filtrarTareas(tareas: Tarea[], filtros: FiltrosTareas): Tarea[] {
  const busqueda = normalizarTexto(filtros.texto)
  return tareas
    .filter((tarea) => {
      if (filtros.estado !== 'todos' && tarea.estado !== filtros.estado) return false
      if (filtros.prioridad !== 'todas' && tarea.prioridad !== filtros.prioridad) return false
      if (!busqueda) return true
      return normalizarTexto(`${tarea.titulo} ${tarea.descripcion}`).includes(busqueda)
    })
    .sort(COMPARADORES[filtros.orden])
}