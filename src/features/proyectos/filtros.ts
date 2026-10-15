import type { EstadoProyecto, Proyecto } from '../../types/modelos'

export type FiltroEstado = 'todos' | EstadoProyecto

export interface Filtros {
  texto: string
  estado: FiltroEstado
}

export const FILTROS_INICIALES: Filtros = { texto: '', estado: 'activo' }

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export function filtrarProyectos(
  proyectos: Proyecto[],
  filtros: Filtros,
): Proyecto[] {
  const busqueda = normalizar(filtros.texto)
  return proyectos.filter((proyecto) => {
    if (filtros.estado !== 'todos' && proyecto.estado !== filtros.estado) {
      return false
    }
    if (!busqueda) return true
    return normalizar(`${proyecto.nombre} ${proyecto.descripcion}`).includes(busqueda)
  })
}