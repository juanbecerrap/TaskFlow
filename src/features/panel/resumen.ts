import { estaVencida } from '../../lib/fechas'
import type { Proyecto, Tarea } from '../../types/modelos'

const MAX_PROXIMAS = 5
const MAX_RECIENTES = 4

export interface ResumenPanel {
  proyectosActivos: number
  totalTareas: number
  // Sin completar: pendientes y en progreso.
  pendientes: number
  completadas: number
  vencidas: number
  // Porcentaje entero de tareas completadas (0 si no hay tareas).
  progreso: number
  proximas: Tarea[]
  recientes: Proyecto[]
}

export function calcularResumen(
  tareas: Tarea[],
  proyectos: Proyecto[],
  ahora: Date = new Date(),
): ResumenPanel {
  const completadas = tareas.filter((tarea) => tarea.estado === 'completada').length
  const activos = proyectos.filter((proyecto) => proyecto.estado === 'activo')

  const proximas = tareas
    .filter((tarea) => tarea.estado !== 'completada' && tarea.fechaLimite !== null)
    .sort((a, b) => (a.fechaLimite?.toMillis() ?? 0) - (b.fechaLimite?.toMillis() ?? 0))
    .slice(0, MAX_PROXIMAS)

  const recientes = [...activos]
    .sort((a, b) => b.actualizadoEn.toMillis() - a.actualizadoEn.toMillis())
    .slice(0, MAX_RECIENTES)

  return {
    proyectosActivos: activos.length,
    totalTareas: tareas.length,
    pendientes: tareas.length - completadas,
    completadas,
    vencidas: tareas.filter((tarea) => estaVencida(tarea, ahora)).length,
    progreso: tareas.length === 0 ? 0 : Math.round((completadas / tareas.length) * 100),
    proximas,
    recientes,
  }
}