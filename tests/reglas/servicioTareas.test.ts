import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import type { DatosTarea } from '../../src/features/tareas/esquemas'
import {
  actualizarTarea,
  cambiarEstadoTarea,
  crearTarea,
  eliminarTarea,
  suscribirTareas,
  suscribirTareasDeProyecto,
} from '../../src/features/tareas/servicioTareas'
import type { Tarea } from '../../src/types/modelos'

type BaseDatos = ReturnType<RulesTestContext['firestore']>

const UID_A = 'usuario-a'
const UID_B = 'usuario-b'

let entorno: RulesTestEnvironment

beforeAll(async () => {
  entorno = await initializeTestEnvironment({
    projectId: 'demo-taskflow',
    firestore: {
      rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'),
    },
  })
})

afterAll(async () => {
  await entorno.cleanup()
})

beforeEach(async () => {
  await entorno.clearFirestore()
})

function como(uid: string): BaseDatos {
  return entorno.authenticatedContext(uid).firestore()
}

async function sembrar(accion: (db: BaseDatos) => Promise<unknown>) {
  await entorno.withSecurityRulesDisabled(async (contexto) => {
    await accion(contexto.firestore())
  })
}

async function leer(coleccion: string, id: string) {
  let existe = false
  let datos: Record<string, unknown> | undefined
  await sembrar(async (db) => {
    const instantanea = await getDoc(doc(db, coleccion, id))
    existe = instantanea.exists()
    datos = instantanea.data()
  })
  return { existe, datos }
}

const proyectoSembrado = (ownerId: string) => ({
  ownerId,
  nombre: 'Proyecto',
  descripcion: '',
  estado: 'activo',
  creadoEn: Timestamp.fromMillis(1000),
  actualizadoEn: Timestamp.fromMillis(1000),
})

const tareaSembrada = (ownerId: string, projectId: string, marcaMs: number) => ({
  ownerId,
  projectId,
  titulo: `Tarea ${marcaMs}`,
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fechaLimite: null,
  creadoEn: Timestamp.fromMillis(marcaMs),
  actualizadoEn: Timestamp.fromMillis(marcaMs),
})

const DATOS: DatosTarea = {
  titulo: 'Escribir informe',
  descripcion: 'Primera versión',
  estado: 'pendiente',
  prioridad: 'alta',
  fechaLimite: '2026-12-31',
}

function esperarLista(
  suscribir: (
    alRecibir: (tareas: Tarea[]) => void,
    alFallar: (error: Error) => void,
  ) => () => void,
) {
  return new Promise<Tarea[]>((resolver, rechazar) => {
    const cancelar = suscribir((lista) => {
      cancelar()
      resolver(lista)
    }, rechazar)
  })
}

describe('servicioTareas contra las reglas reales', () => {
  it('crearTarea guarda los campos esperados con fecha límite y fechas del servidor', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A)))

    const id = await crearTarea(como(UID_A), UID_A, 'p1', DATOS)

    const { existe, datos } = await leer('tasks', id)
    expect(existe).toBe(true)
    expect(datos).toMatchObject({
      ownerId: UID_A,
      projectId: 'p1',
      titulo: 'Escribir informe',
      descripcion: 'Primera versión',
      estado: 'pendiente',
      prioridad: 'alta',
    })
    expect(datos?.fechaLimite).toBeInstanceOf(Timestamp)
    expect((datos?.fechaLimite as Timestamp).toDate().getDate()).toBe(31)
    expect(datos?.creadoEn).toBeInstanceOf(Timestamp)
    expect(datos?.actualizadoEn).toBeInstanceOf(Timestamp)
  })

  it('crearTarea sin fecha límite guarda null', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A)))

    const id = await crearTarea(como(UID_A), UID_A, 'p1', { ...DATOS, fechaLimite: '' })

    expect((await leer('tasks', id)).datos?.fechaLimite).toBeNull()
  })

  it('las reglas rechazan una tarea con título vacío', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A)))

    await assertFails(crearTarea(como(UID_A), UID_A, 'p1', { ...DATOS, titulo: '' }))
  })

  it('no se puede crear una tarea en el proyecto de otro usuario', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'ajeno'), proyectoSembrado(UID_B)))

    await assertFails(crearTarea(como(UID_A), UID_A, 'ajeno', DATOS))
  })

  it('no se puede crear una tarea en un proyecto que no existe', async () => {
    await assertFails(crearTarea(como(UID_A), UID_A, 'no-existe', DATOS))
  })

  it('actualizarTarea edita los datos y solo lo permite al dueño', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaSembrada(UID_A, 'p1', 1000)))

    await assertSucceeds(
      actualizarTarea(como(UID_A), 't1', {
        ...DATOS,
        titulo: 'Nuevo título',
        fechaLimite: '',
      }),
    )
    const { datos } = await leer('tasks', 't1')
    expect(datos).toMatchObject({
      titulo: 'Nuevo título',
      prioridad: 'alta',
      fechaLimite: null,
      ownerId: UID_A,
      projectId: 'p1',
    })

    await assertFails(actualizarTarea(como(UID_B), 't1', DATOS))
  })

  it('cambiarEstadoTarea mueve la tarea entre estados', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaSembrada(UID_A, 'p1', 1000)))

    await assertSucceeds(cambiarEstadoTarea(como(UID_A), 't1', 'en_progreso'))
    expect((await leer('tasks', 't1')).datos?.estado).toBe('en_progreso')

    await assertSucceeds(cambiarEstadoTarea(como(UID_A), 't1', 'completada'))
    expect((await leer('tasks', 't1')).datos?.estado).toBe('completada')

    await assertFails(cambiarEstadoTarea(como(UID_B), 't1', 'pendiente'))
  })

  it('eliminarTarea borra la propia y no puede borrar la ajena', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'tasks', 'propia'), tareaSembrada(UID_A, 'p1', 1000))
      await setDoc(doc(db, 'tasks', 'ajena'), tareaSembrada(UID_B, 'p2', 2000))
    })

    await assertSucceeds(eliminarTarea(como(UID_A), 'propia'))
    expect((await leer('tasks', 'propia')).existe).toBe(false)

    await assertFails(eliminarTarea(como(UID_A), 'ajena'))
    expect((await leer('tasks', 'ajena')).existe).toBe(true)
  })

  it('suscribirTareasDeProyecto entrega solo las del proyecto, la más reciente primero', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'tasks', 'vieja'), tareaSembrada(UID_A, 'p1', 1000))
      await setDoc(doc(db, 'tasks', 'otro-proyecto'), tareaSembrada(UID_A, 'p2', 2000))
      await setDoc(doc(db, 'tasks', 'nueva'), tareaSembrada(UID_A, 'p1', 3000))
      await setDoc(doc(db, 'tasks', 'ajena'), tareaSembrada(UID_B, 'p1', 4000))
    })

    const tareas = await esperarLista((alRecibir, alFallar) =>
      suscribirTareasDeProyecto(como(UID_A), UID_A, 'p1', alRecibir, alFallar),
    )

    expect(tareas.map((tarea) => tarea.id)).toEqual(['nueva', 'vieja'])
  })

  it('suscribirTareas entrega solo las propias, la más reciente primero', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'tasks', 'a1'), tareaSembrada(UID_A, 'p1', 1000))
      await setDoc(doc(db, 'tasks', 'b1'), tareaSembrada(UID_B, 'p9', 2000))
      await setDoc(doc(db, 'tasks', 'a2'), tareaSembrada(UID_A, 'p2', 3000))
    })

    const tareas = await esperarLista((alRecibir, alFallar) =>
      suscribirTareas(como(UID_A), UID_A, alRecibir, alFallar),
    )

    expect(tareas.map((tarea) => tarea.id)).toEqual(['a2', 'a1'])
  })
})