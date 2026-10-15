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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

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

function anonimo(): BaseDatos {
  return entorno.unauthenticatedContext().firestore()
}

async function sembrar(accion: (db: BaseDatos) => Promise<unknown>) {
  await entorno.withSecurityRulesDisabled(async (contexto) => {
    await accion(contexto.firestore())
  })
}

// Documentos de ejemplo
const perfilNuevo = () => ({
  nombre: 'Ana Pérez',
  correo: 'ana@correo.com',
  creadoEn: serverTimestamp(),
})

const proyectoNuevo = (ownerId = UID_A) => ({
  ownerId,
  nombre: 'Proyecto',
  descripcion: '',
  estado: 'activo',
  creadoEn: serverTimestamp(),
  actualizadoEn: serverTimestamp(),
})

const proyectoExistente = (ownerId = UID_A) => ({
  ...proyectoNuevo(ownerId),
  creadoEn: FECHA,
  actualizadoEn: FECHA,
})

const tareaNueva = (ownerId = UID_A, projectId = 'p1') => ({
  ownerId,
  projectId,
  titulo: 'Tarea',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fechaLimite: null as Timestamp | string | null,
  creadoEn: serverTimestamp(),
  actualizadoEn: serverTimestamp(),
})

const tareaExistente = (ownerId = UID_A, projectId = 'p1') => ({
  ...tareaNueva(ownerId, projectId),
  creadoEn: FECHA,
  actualizadoEn: FECHA,
})

describe('reglas de users', () => {
  it('permite crear el perfil propio', async () => {
    await assertSucceeds(setDoc(doc(como(UID_A), 'users', UID_A), perfilNuevo()))
  })

  it('rechaza crear el perfil de otro usuario', async () => {
    await assertFails(setDoc(doc(como(UID_A), 'users', UID_B), perfilNuevo()))
  })

  it('solo permite leer el perfil propio', async () => {
    await sembrar((db) =>
      setDoc(doc(db, 'users', UID_A), {
        nombre: 'Ana Pérez',
        correo: 'ana@correo.com',
        creadoEn: FECHA,
      }),
    )
    await assertSucceeds(getDoc(doc(como(UID_A), 'users', UID_A)))
    await assertFails(getDoc(doc(como(UID_B), 'users', UID_A)))
  })

  it('no permite borrar el perfil', async () => {
    await sembrar((db) =>
      setDoc(doc(db, 'users', UID_A), {
        nombre: 'Ana Pérez',
        correo: 'ana@correo.com',
        creadoEn: FECHA,
      }),
    )
    await assertFails(deleteDoc(doc(como(UID_A), 'users', UID_A)))
  })
})

describe('reglas de projects', () => {
  it('rechaza a usuarios sin sesión', async () => {
    await assertFails(setDoc(doc(anonimo(), 'projects', 'p1'), proyectoNuevo()))
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertFails(getDoc(doc(anonimo(), 'projects', 'p1')))
  })

  it('permite al dueño crear un proyecto', async () => {
    await assertSucceeds(setDoc(doc(como(UID_A), 'projects', 'p1'), proyectoNuevo()))
  })

  it('rechaza crear un proyecto con el ownerId de otro usuario', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'projects', 'p1'), proyectoNuevo(UID_B)),
    )
  })

  it('rechaza campos que no existen en el modelo', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'projects', 'p1'), { ...proyectoNuevo(), admin: true }),
    )
  })

  it('rechaza nombre vacío o estado inválido', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'projects', 'p1'), { ...proyectoNuevo(), nombre: '' }),
    )
    await assertFails(
      setDoc(doc(como(UID_A), 'projects', 'p2'), {
        ...proyectoNuevo(),
        estado: 'inventado',
      }),
    )
  })

  it('rechaza una fecha de creación que no sea la del servidor', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'projects', 'p1'), { ...proyectoNuevo(), creadoEn: FECHA }),
    )
  })

  it('solo permite leer proyectos propios', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertSucceeds(getDoc(doc(como(UID_A), 'projects', 'p1')))
    await assertFails(getDoc(doc(como(UID_B), 'projects', 'p1')))
  })

  it('las consultas deben filtrar por el usuario autenticado', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    const propios = query(
      collection(como(UID_A), 'projects'),
      where('ownerId', '==', UID_A),
    )
    await assertSucceeds(getDocs(propios))

    const ajenos = query(
      collection(como(UID_B), 'projects'),
      where('ownerId', '==', UID_A),
    )
    await assertFails(getDocs(ajenos))

    await assertFails(getDocs(collection(como(UID_A), 'projects')))
  })

  it('permite al dueño actualizar su proyecto', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertSucceeds(
      updateDoc(doc(como(UID_A), 'projects', 'p1'), {
        nombre: 'Nuevo nombre',
        actualizadoEn: serverTimestamp(),
      }),
    )
  })

  it('no permite cambiar el ownerId', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertFails(
      updateDoc(doc(como(UID_A), 'projects', 'p1'), {
        ownerId: UID_B,
        actualizadoEn: serverTimestamp(),
      }),
    )
  })

  it('no permite modificar la fecha de creación', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertFails(
      updateDoc(doc(como(UID_A), 'projects', 'p1'), {
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      }),
    )
  })

  it('otro usuario no puede actualizar ni borrar', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertFails(
      updateDoc(doc(como(UID_B), 'projects', 'p1'), {
        nombre: 'Hackeado',
        actualizadoEn: serverTimestamp(),
      }),
    )
    await assertFails(deleteDoc(doc(como(UID_B), 'projects', 'p1')))
  })

  it('permite al dueño borrar su proyecto', async () => {
    await sembrar((db) => setDoc(doc(db, 'projects', 'p1'), proyectoExistente()))
    await assertSucceeds(deleteDoc(doc(como(UID_A), 'projects', 'p1')))
  })
})

describe('reglas de tasks', () => {
  beforeEach(async () => {
    await sembrar(async (db) => {
      await setDoc(doc(db, 'projects', 'p1'), proyectoExistente(UID_A))
      await setDoc(doc(db, 'projects', 'pB'), proyectoExistente(UID_B))
    })
  })

  it('permite crear una tarea en un proyecto propio', async () => {
    await assertSucceeds(setDoc(doc(como(UID_A), 'tasks', 't1'), tareaNueva()))
  })

  it('rechaza crear una tarea en el proyecto de otro usuario', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't1'), tareaNueva(UID_A, 'pB')),
    )
  })

  it('rechaza crear una tarea con el ownerId de otro usuario', async () => {
    await assertFails(setDoc(doc(como(UID_A), 'tasks', 't1'), tareaNueva(UID_B)))
  })

  it('rechaza una tarea de un proyecto que no existe', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't1'), tareaNueva(UID_A, 'no-existe')),
    )
  })

  it('rechaza título vacío, estado o prioridad inválidos', async () => {
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't1'), { ...tareaNueva(), titulo: '' }),
    )
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't2'), { ...tareaNueva(), estado: 'hecho' }),
    )
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't3'), { ...tareaNueva(), prioridad: 'urgente' }),
    )
  })

  it('acepta una fecha límite de tipo fecha y rechaza texto', async () => {
    await assertSucceeds(
      setDoc(doc(como(UID_A), 'tasks', 't1'), {
        ...tareaNueva(),
        fechaLimite: Timestamp.fromDate(new Date('2030-01-01')),
      }),
    )
    await assertFails(
      setDoc(doc(como(UID_A), 'tasks', 't2'), {
        ...tareaNueva(),
        fechaLimite: 'mañana',
      }),
    )
  })

  it('permite al dueño mover la tarea de estado', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaExistente()))
    await assertSucceeds(
      updateDoc(doc(como(UID_A), 'tasks', 't1'), {
        estado: 'en_progreso',
        actualizadoEn: serverTimestamp(),
      }),
    )
  })

  it('no permite cambiar el proyecto ni el ownerId de una tarea', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaExistente()))
    await assertFails(
      updateDoc(doc(como(UID_A), 'tasks', 't1'), {
        projectId: 'pB',
        actualizadoEn: serverTimestamp(),
      }),
    )
    await assertFails(
      updateDoc(doc(como(UID_A), 'tasks', 't1'), {
        ownerId: UID_B,
        actualizadoEn: serverTimestamp(),
      }),
    )
  })

  it('otro usuario no puede leer, actualizar ni borrar la tarea', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaExistente()))
    await assertFails(getDoc(doc(como(UID_B), 'tasks', 't1')))
    await assertFails(
      updateDoc(doc(como(UID_B), 'tasks', 't1'), {
        estado: 'completada',
        actualizadoEn: serverTimestamp(),
      }),
    )
    await assertFails(deleteDoc(doc(como(UID_B), 'tasks', 't1')))
  })

  it('permite al dueño leer y borrar su tarea', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaExistente()))
    await assertSucceeds(getDoc(doc(como(UID_A), 'tasks', 't1')))
    await assertSucceeds(deleteDoc(doc(como(UID_A), 'tasks', 't1')))
  })

  it('permite borrar un proyecto y sus tareas en un mismo lote', async () => {
    await sembrar((db) => setDoc(doc(db, 'tasks', 't1'), tareaExistente()))
    const db = como(UID_A)
    const lote = writeBatch(db)
    lote.delete(doc(db, 'tasks', 't1'))
    lote.delete(doc(db, 'projects', 'p1'))
    await assertSucceeds(lote.commit())
  })
})