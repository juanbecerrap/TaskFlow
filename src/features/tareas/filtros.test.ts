import type { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import type { EstadoTarea, PrioridadTarea, Tarea } from '../../types/modelos'
import { filtrarTareas, FILTROS_TAREAS_INICIALES } from './filtros'

const marca = (milisegundos: number) =>
  ({ toMillis: () => milisegundos }) as unknown as Timestamp

interface Opciones {
  descripcion?: string
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  fecha?: number | null
  actualizado: number
}

function crear(titulo: string, opciones: Opciones): Tarea {
  return {
    id: titulo,
    titulo,
    descripcion: opciones.descripcion ?? '',
    estado: opciones.estado ?? 'pendiente',
    prioridad: opciones.prioridad ?? 'media',
    fechaLimite: opciones.fecha == null ? null : marca(opciones.fecha),
    actualizadoEn: marca(opciones.actualizado),
  } as unknown as Tarea
}

const TAREAS = [
  crear('Diseñar logo', {
    descripcion: 'Tres versiones',
    prioridad: 'alta',
    fecha: 300,
    actualizado: 10,
  }),
  crear('Escribir pruebas', { estado: 'en_progreso', prioridad: 'baja', fecha: 100, actualizado: 30 }),
  crear('Publicar sitio', { estado: 'completada', prioridad: 'alta', fecha: null, actualizado: 20 }),
  crear('Revisar copy', { prioridad: 'media', fecha: 200, actualizado: 40 }),
]

const titulos = (lista: Tarea[]) => lista.map((tarea) => tarea.titulo)

describe('filtrarTareas', () => {
  it('sin filtros muestra todas, la más reciente primero', () => {
    expect(titulos(filtrarTareas(TAREAS, FILTROS_TAREAS_INICIALES))).toEqual([
      'Revisar copy',
      'Escribir pruebas',
      'Publicar sitio',
      'Diseñar logo',
    ])
  })

  it('filtra por estado', () => {
    const filtros = { ...FILTROS_TAREAS_INICIALES, estado: 'completada' as const }
    expect(titulos(filtrarTareas(TAREAS, filtros))).toEqual(['Publicar sitio'])
  })

  it('filtra por prioridad', () => {
    const filtros = { ...FILTROS_TAREAS_INICIALES, prioridad: 'alta' as const }
    expect(titulos(filtrarTareas(TAREAS, filtros))).toEqual(['Publicar sitio', 'Diseñar logo'])
  })

  it('busca sin distinguir mayúsculas ni acentos, en título y descripción', () => {
    const porTitulo = { ...FILTROS_TAREAS_INICIALES, texto: 'DISENAR' }
    expect(titulos(filtrarTareas(TAREAS, porTitulo))).toEqual(['Diseñar logo'])

    const porDescripcion = { ...FILTROS_TAREAS_INICIALES, texto: 'versiones' }
    expect(titulos(filtrarTareas(TAREAS, porDescripcion))).toEqual(['Diseñar logo'])
  })

  it('ordena por fecha límite y deja las que no tienen fecha al final', () => {
    const filtros = { ...FILTROS_TAREAS_INICIALES, orden: 'fecha' as const }
    expect(titulos(filtrarTareas(TAREAS, filtros))).toEqual([
      'Escribir pruebas',
      'Revisar copy',
      'Diseñar logo',
      'Publicar sitio',
    ])
  })

  it('ordena por prioridad y desempata por fecha límite', () => {
    const filtros = { ...FILTROS_TAREAS_INICIALES, orden: 'prioridad' as const }
    expect(titulos(filtrarTareas(TAREAS, filtros))).toEqual([
      'Diseñar logo',
      'Publicar sitio',
      'Revisar copy',
      'Escribir pruebas',
    ])
  })

  it('combina filtros y no modifica la lista original', () => {
    const copia = [...TAREAS]
    const filtros = {
      texto: 'a',
      estado: 'pendiente' as const,
      prioridad: 'todas' as const,
      orden: 'reciente' as const,
    }
    expect(titulos(filtrarTareas(TAREAS, filtros))).toEqual(['Revisar copy', 'Diseñar logo'])
    expect(TAREAS).toEqual(copia)
  })
})