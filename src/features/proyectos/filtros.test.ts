import { describe, expect, it } from 'vitest'
import type { EstadoProyecto, Proyecto } from '../../types/modelos'
import { filtrarProyectos, FILTROS_INICIALES } from './filtros'

function crear(
  nombre: string,
  estado: EstadoProyecto = 'activo',
  descripcion = '',
): Proyecto {
  return { id: nombre, nombre, descripcion, estado } as unknown as Proyecto
}

const PROYECTOS = [
  crear('Rediseño web', 'activo', 'Sitio corporativo nuevo'),
  crear('App móvil', 'activo', 'Versión para Android'),
  crear('Campaña 2025', 'archivado', 'Marketing del año pasado'),
]

const nombres = (lista: Proyecto[]) => lista.map((proyecto) => proyecto.nombre)

describe('filtrarProyectos', () => {
  it('por defecto muestra solo los activos', () => {
    expect(nombres(filtrarProyectos(PROYECTOS, FILTROS_INICIALES))).toEqual([
      'Rediseño web',
      'App móvil',
    ])
  })

  it('filtra por archivados o muestra todos', () => {
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: '', estado: 'archivado' })),
    ).toEqual(['Campaña 2025'])
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: '', estado: 'todos' })),
    ).toHaveLength(3)
  })

  it('busca sin distinguir mayúsculas ni acentos', () => {
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: 'REDISENO', estado: 'todos' })),
    ).toEqual(['Rediseño web'])
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: 'movil', estado: 'todos' })),
    ).toEqual(['App móvil'])
  })

  it('busca también en la descripción', () => {
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: 'android', estado: 'todos' })),
    ).toEqual(['App móvil'])
  })

  it('combina búsqueda y estado', () => {
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: 'campana', estado: 'activo' })),
    ).toEqual([])
    expect(
      nombres(filtrarProyectos(PROYECTOS, { texto: 'campana', estado: 'todos' })),
    ).toEqual(['Campaña 2025'])
  })
})