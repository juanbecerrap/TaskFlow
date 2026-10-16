import { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import type {
  EstadoProyecto,
  EstadoTarea,
  Proyecto,
  Tarea,
} from '../../types/modelos'
import { calcularResumen } from './resumen'

const AHORA = new Date(2026, 9, 15, 21, 0)

function dia(mes: number, numero: number) {
  return Timestamp.fromDate(new Date(2026, mes, numero, 12))
}

function tarea(id: string, estado: EstadoTarea, fechaLimite: Timestamp | null): Tarea {
  return {
    id,
    ownerId: 'u1',
    projectId: 'p1',
    titulo: id,
    descripcion: '',
    estado,
    prioridad: 'media',
    fechaLimite,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(1),
  }
}

function proyecto(id: string, estado: EstadoProyecto, actualizado: number): Proyecto {
  return {
    id,
    ownerId: 'u1',
    nombre: id,
    descripcion: '',
    estado,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(actualizado),
  }
}

const TAREAS = [
  tarea('t1', 'pendiente', dia(9, 14)),
  tarea('t2', 'en_progreso', dia(9, 20)),
  tarea('t3', 'completada', dia(9, 10)),
  tarea('t4', 'pendiente', null),
  tarea('t5', 'pendiente', dia(9, 16)),
]

const ids = (lista: { id: string }[]) => lista.map((elemento) => elemento.id)

describe('calcularResumen', () => {
  it('cuenta proyectos activos y tareas por estado', () => {
    const resumen = calcularResumen(
      TAREAS,
      [proyecto('p1', 'activo', 30), proyecto('p2', 'archivado', 40)],
      AHORA,
    )

    expect(resumen.proyectosActivos).toBe(1)
    expect(resumen.totalTareas).toBe(5)
    expect(resumen.pendientes).toBe(4)
    expect(resumen.completadas).toBe(1)
  })

  it('cuenta como vencidas solo las sin completar con fecha pasada', () => {
    const resumen = calcularResumen(TAREAS, [], AHORA)

    // t1 está vencida; t3 tiene fecha pasada pero está completada.
    expect(resumen.vencidas).toBe(1)
  })

  it('calcula el progreso como porcentaje entero y es 0 sin tareas', () => {
    expect(calcularResumen(TAREAS, [], AHORA).progreso).toBe(20)
    expect(
      calcularResumen(
        [tarea('a', 'completada', null), tarea('b', 'pendiente', null), tarea('c', 'pendiente', null)],
        [],
        AHORA,
      ).progreso,
    ).toBe(33)
    expect(calcularResumen([], [], AHORA).progreso).toBe(0)
  })

  it('las próximas son las sin completar con fecha, la más cercana primero y máximo 5', () => {
    expect(ids(calcularResumen(TAREAS, [], AHORA).proximas)).toEqual(['t1', 't5', 't2'])

    const muchas = Array.from({ length: 7 }, (_, n) =>
      tarea(`m${n}`, 'pendiente', dia(10, n + 1)),
    )
    expect(ids(calcularResumen(muchas, [], AHORA).proximas)).toEqual([
      'm0',
      'm1',
      'm2',
      'm3',
      'm4',
    ])
  })

  it('los recientes son solo activos, el más reciente primero y máximo 4', () => {
    const proyectos = [
      proyecto('p1', 'activo', 10),
      proyecto('p2', 'archivado', 99),
      proyecto('p3', 'activo', 30),
      proyecto('p4', 'activo', 20),
      proyecto('p5', 'activo', 40),
      proyecto('p6', 'activo', 50),
    ]

    expect(ids(calcularResumen([], proyectos, AHORA).recientes)).toEqual([
      'p6',
      'p5',
      'p3',
      'p4',
    ])
  })
})