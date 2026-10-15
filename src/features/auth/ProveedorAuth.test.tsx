import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProveedorAuth } from './ProveedorAuth'
import { useAuth } from './useAuth'

const simulado = vi.hoisted(() => ({
  desuscribir: vi.fn(),
  alCambiar: undefined as ((usuario: unknown) => void) | undefined,
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(
    (_auth: unknown, siguiente: (usuario: unknown) => void) => {
      simulado.alCambiar = siguiente
      return simulado.desuscribir
    },
  ),
}))

function Lector() {
  const { usuario, cargando } = useAuth()
  if (cargando) return <p>cargando</p>
  return <p>{usuario ? `sesión: ${usuario.email}` : 'sin sesión'}</p>
}

describe('ProveedorAuth', () => {
  it('empieza en estado de carga', () => {
    render(
      <ProveedorAuth>
        <Lector />
      </ProveedorAuth>,
    )
    expect(screen.getByText('cargando')).toBeInTheDocument()
  })

  it('expone el usuario cuando Firebase informa una sesión', () => {
    render(
      <ProveedorAuth>
        <Lector />
      </ProveedorAuth>,
    )
    act(() => {
      simulado.alCambiar?.({ email: 'ana@correo.com' })
    })
    expect(screen.getByText('sesión: ana@correo.com')).toBeInTheDocument()
  })

  it('expone "sin sesión" cuando Firebase informa null', () => {
    render(
      <ProveedorAuth>
        <Lector />
      </ProveedorAuth>,
    )
    act(() => {
      simulado.alCambiar?.(null)
    })
    expect(screen.getByText('sin sesión')).toBeInTheDocument()
  })

  it('deja de escuchar al desmontarse', () => {
    const { unmount } = render(
      <ProveedorAuth>
        <Lector />
      </ProveedorAuth>,
    )
    unmount()
    expect(simulado.desuscribir).toHaveBeenCalled()
  })
})