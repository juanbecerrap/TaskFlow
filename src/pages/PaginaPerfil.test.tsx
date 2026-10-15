import { render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { describe, expect, it } from 'vitest'
import { ContextoAuth } from '../features/auth/contextoAuth'
import { PaginaPerfil } from './PaginaPerfil'

function renderizarCon(usuario: unknown) {
  render(
    <ContextoAuth.Provider
      value={{ usuario: usuario as User, cargando: false }}
    >
      <PaginaPerfil />
    </ContextoAuth.Provider>,
  )
}

describe('PaginaPerfil', () => {
  it('muestra los datos reales de la cuenta', () => {
    renderizarCon({
      displayName: 'Ana Pérez',
      email: 'ana@correo.com',
      metadata: { creationTime: 'Wed, 14 Oct 2026 15:00:00 GMT' },
    })

    expect(screen.getByRole('heading', { level: 1, name: 'Perfil' })).toBeInTheDocument()
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByText('ana@correo.com')).toBeInTheDocument()
    expect(screen.getByText(/14 de octubre de 2026/)).toBeInTheDocument()
  })

  it('muestra "Sin nombre" si la cuenta no tiene nombre', () => {
    renderizarCon({
      displayName: null,
      email: 'ana@correo.com',
      metadata: {},
    })

    expect(screen.getByText('Sin nombre')).toBeInTheDocument()
  })
})