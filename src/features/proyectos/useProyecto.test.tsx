import { act, renderHook } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import { describe, expect, it, vi } from 'vitest'
import type { Proyecto } from '../../types/modelos'
import { useProyecto } from './useProyecto'

const servicio = vi.hoisted(() => ({ suscribirProyecto: vi.fn() }))

vi.mock('./servicioProyectos', () => servicio)

const PROYECTO = { id: 'p1', nombre: 'Uno' } as unknown as Proyecto

function capturar() {
  const captura = {
    recibir: undefined as ((proyecto: Proyecto | null) => void) | undefined,
    fallar: undefined as ((error: Error) => void) | undefined,
  }
  servicio.suscribirProyecto.mockImplementation(
    (
      _db: unknown,
      _id: string,
      alRecibir: (proyecto: Proyecto | null) => void,
      alFallar: (error: Error) => void,
    ) => {
      captura.recibir = alRecibir
      captura.fallar = alFallar
      return vi.fn()
    },
  )
  return captura
}

describe('useProyecto', () => {
  it('empieza cargando y entrega el proyecto', () => {
    const captura = capturar()
    const { result } = renderHook(() => useProyecto('p1'))
    expect(result.current.cargando).toBe(true)

    act(() => captura.recibir?.(PROYECTO))

    expect(result.current.cargando).toBe(false)
    expect(result.current.proyecto).toEqual(PROYECTO)
    expect(result.current.noEncontrado).toBe(false)
  })

  it('un documento que no existe se marca como no encontrado', () => {
    const captura = capturar()
    const { result } = renderHook(() => useProyecto('p1'))

    act(() => captura.recibir?.(null))

    expect(result.current.noEncontrado).toBe(true)
    expect(result.current.proyecto).toBeNull()
  })

  it('"permiso denegado" se trata como no encontrado, sin mostrar error', () => {
    const captura = capturar()
    const { result } = renderHook(() => useProyecto('p1'))

    act(() => captura.fallar?.(new FirebaseError('permission-denied', 'x')))

    expect(result.current.noEncontrado).toBe(true)
    expect(result.current.error).toBe('')
    expect(result.current.cargando).toBe(false)
  })

  it('otros errores se muestran en español', () => {
    const captura = capturar()
    const { result } = renderHook(() => useProyecto('p1'))

    act(() => captura.fallar?.(new FirebaseError('unavailable', 'x')))

    expect(result.current.noEncontrado).toBe(false)
    expect(result.current.error).toBe(
      'El servicio no está disponible ahora. Inténtalo más tarde.',
    )
  })

  it('al cambiar de proyecto vuelve a cargar', () => {
    const captura = capturar()
    const { result, rerender } = renderHook(({ id }) => useProyecto(id), {
      initialProps: { id: 'p1' },
    })
    act(() => captura.recibir?.(PROYECTO))
    expect(result.current.cargando).toBe(false)

    rerender({ id: 'p2' })

    expect(result.current.cargando).toBe(true)
    expect(result.current.proyecto).toBeNull()
  })
})