import { describe, expect, it } from 'vitest'
import { esquemaTarea } from './esquemas'

interface Resultado {
  error?: { issues: { path: PropertyKey[]; message: string }[] }
}

function mensajeDe(resultado: Resultado, campo: string) {
  return resultado.error?.issues.find((caso) => caso.path[0] === campo)?.message
}

const VALIDA = {
  titulo: 'Diseñar logo',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fechaLimite: '',
}

describe('esquemaTarea', () => {
  it('acepta datos válidos y recorta espacios', () => {
    const resultado = esquemaTarea.safeParse({
      ...VALIDA,
      titulo: '  Diseñar logo ',
      descripcion: '  Tres versiones ',
    })
    expect(resultado.success).toBe(true)
    expect(resultado.data).toEqual({
      ...VALIDA,
      titulo: 'Diseñar logo',
      descripcion: 'Tres versiones',
    })
  })

  it('rechaza un título vacío o de solo espacios', () => {
    expect(mensajeDe(esquemaTarea.safeParse({ ...VALIDA, titulo: '' }), 'titulo')).toBe(
      'Escribe el título de la tarea',
    )
    expect(mensajeDe(esquemaTarea.safeParse({ ...VALIDA, titulo: '   ' }), 'titulo')).toBe(
      'Escribe el título de la tarea',
    )
  })

  it('rechaza un título de más de 120 caracteres', () => {
    const resultado = esquemaTarea.safeParse({ ...VALIDA, titulo: 'a'.repeat(121) })
    expect(mensajeDe(resultado, 'titulo')).toBe('Usa como máximo 120 caracteres')
  })

  it('permite descripción vacía y rechaza más de 1000 caracteres', () => {
    expect(esquemaTarea.safeParse(VALIDA).success).toBe(true)
    const larga = esquemaTarea.safeParse({ ...VALIDA, descripcion: 'a'.repeat(1001) })
    expect(mensajeDe(larga, 'descripcion')).toBe('Usa como máximo 1000 caracteres')
  })

  it('rechaza estados y prioridades desconocidos', () => {
    expect(esquemaTarea.safeParse({ ...VALIDA, estado: 'hecha' }).success).toBe(false)
    expect(esquemaTarea.safeParse({ ...VALIDA, prioridad: 'urgente' }).success).toBe(false)
  })

  it('acepta fecha vacía o válida y rechaza una inválida', () => {
    expect(esquemaTarea.safeParse({ ...VALIDA, fechaLimite: '' }).success).toBe(true)
    expect(esquemaTarea.safeParse({ ...VALIDA, fechaLimite: '2026-12-31' }).success).toBe(true)
    const invalida = esquemaTarea.safeParse({ ...VALIDA, fechaLimite: '2026-02-31' })
    expect(mensajeDe(invalida, 'fechaLimite')).toBe('Elige una fecha válida')
  })
})