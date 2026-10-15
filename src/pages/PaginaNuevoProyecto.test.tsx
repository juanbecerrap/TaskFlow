import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ContextoAuth } from '../features/auth/contextoAuth'
import { PaginaNuevoProyecto } from './PaginaNuevoProyecto'

const servicio = vi.hoisted(() => ({ crearProyecto: vi.fn() }))

vi.mock('../features/proyectos/servicioProyectos', () => servicio)

const USUARIO = { uid: 'u1' } as unknown as User

function renderizar() {
  render(
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      <MemoryRouter initialEntries={['/proyectos/nuevo']}>
        <Routes>
          <Route path="/proyectos/nuevo" element={<PaginaNuevoProyecto />} />
          <Route path="/proyectos/:id" element={<p>Detalle nuevo</p>} />
          <Route path="/proyectos" element={<p>Pantalla de lista</p>} />
        </Routes>
      </MemoryRouter>
    </ContextoAuth.Provider>,
  )
}

describe('PaginaNuevoProyecto', () => {
  it('no envía un proyecto sin nombre', async () => {
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByText('Escribe el nombre del proyecto')).toBeInTheDocument()
    expect(servicio.crearProyecto).not.toHaveBeenCalled()
  })

  it('crea el proyecto y lleva a su detalle', async () => {
    servicio.crearProyecto.mockResolvedValueOnce('nuevo-id')
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Nombre'), 'Rediseño web')
    await usuario.type(screen.getByLabelText('Descripción'), 'Sitio nuevo')
    await usuario.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByText('Detalle nuevo')).toBeInTheDocument()
    expect(servicio.crearProyecto).toHaveBeenCalledWith(expect.anything(), 'u1', {
      nombre: 'Rediseño web',
      descripcion: 'Sitio nuevo',
    })
  })

  it('muestra el error si no se puede crear', async () => {
    servicio.crearProyecto.mockRejectedValueOnce(
      new FirebaseError('permission-denied', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Nombre'), 'Rediseño web')
    await usuario.click(screen.getByRole('button', { name: 'Crear proyecto' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
    expect(screen.queryByText('Detalle nuevo')).not.toBeInTheDocument()
  })
})