import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { describe, expect, it, vi } from 'vitest'
import type { Tarea } from '../../types/modelos'
import { ContextoAuth } from '../auth/contextoAuth'
import { useTareas } from './useTareas'

const servicio = vi.hoisted(() => ({
  suscribirTareas: vi.fn(),
  suscribirTareasDeProyecto: vi.fn(),
}))

vi.mock('./servicioTareas', () => servicio)

const USUARIO = { uid: 'u1' } as unknown as User

function Envoltorio({ children }: { children: ReactNode }) {
  return (
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      {children}
    </ContextoAuth.Provider>
  )
}

const TAREA = { id: 't1', titulo: 'Uno' } as unknown as Tarea

describe('useTareas', () => {
  it('sin proyecto entrega todas las tareas cuando llegan', () => {
    let recibir: ((tareas: Tarea[]) => void) | undefined
    servicio.suscribirTareas.mockImplementation(
      (_db: unknown, _uid: string, alRecibir: (tareas: Tarea[]) => void) => {
        recibir = alRecibir
        return vi.fn()
      },
    )

    const { result } = renderHook(() => useTareas(), { wrapper: Envoltorio })
    expect(result.current.cargando).toBe(true)
    expect(servicio.suscribirTareas).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
      expect.any(Function),
      expect.any(Function),
    )
    expect(servicio.suscribirTareasDeProyecto).not.toHaveBeenCalled()

    act(() => recibir?.([TAREA]))
    expect(result.current.cargando).toBe(false)
    expect(result.current.tareas).toEqual([TAREA])
    expect(result.current.error).toBe('')
  })

  it('con proyecto escucha solo las tareas de ese proyecto', () => {
    servicio.suscribirTareasDeProyecto.mockReturnValue(vi.fn())

    renderHook(() => useTareas('p1'), { wrapper: Envoltorio })

    expect(servicio.suscribirTareasDeProyecto).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
      'p1',
      expect.any(Function),
      expect.any(Function),
    )
    expect(servicio.suscribirTareas).not.toHaveBeenCalled()
  })

  it('traduce el error a un mensaje en español', () => {
    let fallar: ((error: Error) => void) | undefined
    servicio.suscribirTareas.mockImplementation(
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

    const { result } = renderHook(() => useTareas(), { wrapper: Envoltorio })
    act(() => fallar?.(new FirebaseError('permission-denied', 'x')))

    expect(result.current.cargando).toBe(false)
    expect(result.current.error).toBe('No tienes permiso para realizar esta acción.')
  })

  it('deja de escuchar al desmontarse', () => {
    const cancelar = vi.fn()
    servicio.suscribirTareas.mockReturnValue(cancelar)

    const { unmount } = renderHook(() => useTareas(), { wrapper: Envoltorio })
    unmount()

    expect(cancelar).toHaveBeenCalled()
  })
})