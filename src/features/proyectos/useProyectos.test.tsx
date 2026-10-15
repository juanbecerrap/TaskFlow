import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { describe, expect, it, vi } from 'vitest'
import type { Proyecto } from '../../types/modelos'
import { ContextoAuth } from '../auth/contextoAuth'
import { useProyectos } from './useProyectos'

const servicio = vi.hoisted(() => ({ suscribirProyectos: vi.fn() }))

vi.mock('./servicioProyectos', () => servicio)

const USUARIO = { uid: 'u1' } as unknown as User

function Envoltorio({ children }: { children: ReactNode }) {
  return (
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      {children}
    </ContextoAuth.Provider>
  )
}

const PROYECTO = { id: 'p1', nombre: 'Uno' } as unknown as Proyecto

describe('useProyectos', () => {
  it('empieza cargando y entrega la lista cuando llega', () => {
    let recibir: ((proyectos: Proyecto[]) => void) | undefined
    servicio.suscribirProyectos.mockImplementation(
      (_db: unknown, _uid: string, alRecibir: (proyectos: Proyecto[]) => void) => {
        recibir = alRecibir
        return vi.fn()
      },
    )

    const { result } = renderHook(() => useProyectos(), { wrapper: Envoltorio })
    expect(result.current.cargando).toBe(true)
    expect(servicio.suscribirProyectos).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
      expect.any(Function),
      expect.any(Function),
    )

    act(() => recibir?.([PROYECTO]))
    expect(result.current.cargando).toBe(false)
    expect(result.current.proyectos).toEqual([PROYECTO])
    expect(result.current.error).toBe('')
  })

  it('traduce el error a un mensaje en español', () => {
    let fallar: ((error: Error) => void) | undefined
    servicio.suscribirProyectos.mockImplementation(
      (
        _db: unknown,
        _uid: string,
        _alRecibir: unknown,
        alFallar: (error: Error) => void,
      ) => {
        fallar = alFallar
        return vi.fn()
      },
    )

    const { result } = renderHook(() => useProyectos(), { wrapper: Envoltorio })
    act(() => fallar?.(new FirebaseError('permission-denied', 'x')))

    expect(result.current.cargando).toBe(false)
    expect(result.current.error).toBe('No tienes permiso para realizar esta acción.')
  })

  it('deja de escuchar al desmontarse', () => {
    const cancelar = vi.fn()
    servicio.suscribirProyectos.mockReturnValue(cancelar)

    const { unmount } = renderHook(() => useProyectos(), { wrapper: Envoltorio })
    unmount()

    expect(cancelar).toHaveBeenCalled()
  })
})