import { readFileSync } from 'node:fs'
import {
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { suscribirProyecto } from '../../src/features/proyectos/servicioProyectos'
import type { Proyecto } from '../../src/types/modelos'

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
  await entorno.withSecurityRulesDisabled(async (contexto) => {
    await setDoc(doc(contexto.firestore(), 'projects', 'p1'), {
      ownerId: UID_A,
      nombre: 'De A',
      descripcion: '',
      estado: 'activo',
      creadoEn: Timestamp.fromMillis(1000),
      actualizadoEn: Timestamp.fromMillis(1000),
    })
  })
})

function como(uid: string): BaseDatos {
  return entorno.authenticatedContext(uid).firestore()
}

// Devuelve lo primero que ocurra: un proyecto o un error.
function primerEvento(uid: string, id: string) {
  return new Promise<{ proyecto: Proyecto | null } | { error: Error }>((resolver) => {
    const cancelar = suscribirProyecto(
      como(uid),
      id,
      (proyecto) => {
        cancelar()
        resolver({ proyecto })
      },
      (error) => {
        cancelar()
        resolver({ error })
      },
    )
  })
}

describe('suscribirProyecto contra las reglas reales', () => {
  it('entrega el proyecto al dueño', async () => {
    const evento = await primerEvento(UID_A, 'p1')

    expect('proyecto' in evento && evento.proyecto?.nombre).toBe('De A')
  })

  it('otro usuario recibe "permiso denegado"', async () => {
    const evento = await primerEvento(UID_B, 'p1')

    expect('error' in evento).toBe(true)
    expect('error' in evento && (evento.error as { code?: string }).code).toBe(
      'permission-denied',
    )
  })

  it('un proyecto que no existe responde igual que uno ajeno', async () => {
    const evento = await primerEvento(UID_A, 'no-existe')

    expect('error' in evento).toBe(true)
    expect('error' in evento && (evento.error as { code?: string }).code).toBe(
      'permission-denied',
    )
  })
})