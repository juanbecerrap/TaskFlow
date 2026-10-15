import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  actualizarProyecto,
  cambiarEstadoProyecto,
  crearProyecto,
  eliminarProyecto,
  suscribirProyectos,
} from '../../src/features/proyectos/servicioProyectos'
import type { Proyecto } from '../../src/types/modelos'

type BaseDatos = ReturnType<RulesTestContext['firestore']>

const UID_A = 'usuario-a'
const UID_B = 'usuario-b'
const FECHA = Timestamp.fromMillis(1_700_000_000_000)

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

async function contar(coleccion: string) {
  let total = 0
  await sembrar(async (db) => {
    total = (await getDocs(collection(db, coleccion))).size
  })
  return total
}

const proyectoSembrado = (ownerId: string, marcaMs: number) => ({
  ownerId,
  nombre: 'Sembrado',
  descripcion: '',
  estado: 'activo',
  creadoEn: Timestamp.fromMillis(marcaMs),
  actualizadoEn: Timestamp.fromMillis(marcaMs),
})

const tareaSembrada = (ownerId: string, projectId: string) => ({
  ownerId,
  projectId,
  titulo: 'Tarea',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fechaLimite: null,
  creadoEn: FECHA,
  actualizadoEn: FECHA,
})

describe('servicioProyectos contra las reglas reales', () => {
  it('crearProyecto guarda los campos esperados con fechas del servidor', async () => {
    const id = await crearProyecto(como(UID_A), UID_A, {
      nombre: 'Mi proyecto',
      descripcion: 'Detalle',
    })

    const { existe, datos } = await leer('projects', id)
    expect(existe).toBe(true)
    expect(datos).toMatchObject({
      ownerId: UID_A,
      nombre: 'Mi proyecto',
      descripcion: 'Detalle',
      estado: 'activo',
    })
    expect(datos?.creadoEn).toBeInstanceOf(Timestamp)
    expect(datos?.actualizadoEn).toBeInstanceOf(Timestamp)
  })

  it('las reglas rechazan un proyecto con nombre vacío', async () => {
    await assertFails(
      crearProyecto(como(UID_A), UID_A, { nombre: '', descripcion: '' }),
    )
  })

  it('actualizarProyecto edita los datos y solo lo permite al dueño', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A, 1000)))

    await assertSucceeds(
      actualizarProyecto(como(UID_A), 'p1', { nombre: 'Nuevo', descripcion: 'Otro' }),
    )
    const { datos } = await leer('projects', 'p1')
    expect(datos).toMatchObject({ nombre: 'Nuevo', descripcion: 'Otro' })

    await assertFails(
      actualizarProyecto(como(UID_B), 'p1', { nombre: 'Hackeado', descripcion: '' }),
    )
  })

  it('cambiarEstadoProyecto archiva y reactiva', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A, 1000)))

    await assertSucceeds(cambiarEstadoProyecto(como(UID_A), 'p1', 'archivado'))
    expect((await leer('projects', 'p1')).datos?.estado).toBe('archivado')

    await assertSucceeds(cambiarEstadoProyecto(como(UID_A), 'p1', 'activo'))
    expect((await leer('projects', 'p1')).datos?.estado).toBe('activo')
  })

  it('suscribirProyectos entrega solo los propios, el más reciente primero', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'projects', 'antiguo'), proyectoSembrado(UID_A, 1000))
      await setDoc(doc(db, 'projects', 'ajeno'), proyectoSembrado(UID_B, 2000))
      await setDoc(doc(db, 'projects', 'reciente'), proyectoSembrado(UID_A, 3000))
    })

    const proyectos = await new Promise<Proyecto[]>((resolver, rechazar) => {
      const cancelar = suscribirProyectos(
        como(UID_A),
        UID_A,
        (lista) => {
          cancelar()
          resolver(lista)
        },
        rechazar,
      )
    })

    expect(proyectos.map((proyecto) => proyecto.id)).toEqual(['reciente', 'antiguo'])
  })

  it('eliminarProyecto borra el proyecto y sus tareas, sin tocar lo demás', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A, 1000))
      await setDoc(doc(db, 'projects', 'p2'), proyectoSembrado(UID_A, 2000))
      await setDoc(doc(db, 'tasks', 't1'), tareaSembrada(UID_A, 'p1'))
      await setDoc(doc(db, 'tasks', 't2'), tareaSembrada(UID_A, 'p1'))
      await setDoc(doc(db, 'tasks', 't3'), tareaSembrada(UID_A, 'p2'))
    })

    await assertSucceeds(eliminarProyecto(como(UID_A), UID_A, 'p1'))

    expect((await leer('projects', 'p1')).existe).toBe(false)
    expect((await leer('tasks', 't1')).existe).toBe(false)
    expect((await leer('tasks', 't2')).existe).toBe(false)
    expect((await leer('projects', 'p2')).existe).toBe(true)
    expect((await leer('tasks', 't3')).existe).toBe(true)
  })

  it('eliminarProyecto maneja más de 500 tareas en varios lotes', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_A, 1000))
      for (let inicio = 0; inicio < 520; inicio += 500) {
        const lote = writeBatch(db)
        for (let n = inicio; n < Math.min(inicio + 500, 520); n++) {
          lote.set(doc(db, 'tasks', `t${n}`), tareaSembrada(UID_A, 'p1'))
        }
        await lote.commit()
      }
    })
    expect(await contar('tasks')).toBe(520)

    await assertSucceeds(eliminarProyecto(como(UID_A), UID_A, 'p1'))

    expect(await contar('tasks')).toBe(0)
    expect((await leer('projects', 'p1')).existe).toBe(false)
  })

  it('eliminarProyecto no puede borrar el proyecto de otro usuario', async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'projects', 'p1'), proyectoSembrado(UID_B, 1000))
      await setDoc(doc(db, 'tasks', 't1'), tareaSembrada(UID_B, 'p1'))
    })

    await assertFails(eliminarProyecto(como(UID_A), UID_A, 'p1'))

    expect((await leer('projects', 'p1')).existe).toBe(true)
    expect((await leer('tasks', 't1')).existe).toBe(true)
  })
})