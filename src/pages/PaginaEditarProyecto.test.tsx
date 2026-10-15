import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Proyecto } from '../types/modelos'
import { PaginaEditarProyecto } from './PaginaEditarProyecto'

const hooks = vi.hoisted(() => ({ useProyecto: vi.fn() }))
const servicio = vi.hoisted(() => ({ actualizarProyecto: vi.fn() }))

vi.mock('../features/proyectos/useProyecto', () => hooks)
vi.mock('../features/proyectos/servicioProyectos', () => servicio)

const FECHA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))

const PROYECTO: Proyecto = {
  id: 'p1',
  ownerId: 'u1',
  nombre: 'Rediseño web',
  descripcion: 'Sitio nuevo',
  estado: 'activo',
  creadoEn: FECHA,
  actualizadoEn: FECHA,
}

function renderizar() {
  render(
    <MemoryRouter initialEntries={['/proyectos/p1/editar']}>
      <Routes>
        <Route path="/proyectos/:id/editar" element={<PaginaEditarProyecto />} />
        <Route path="/proyectos/:id" element={<p>Detalle p1</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PaginaEditarProyecto', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useProyecto.mockReturnValue({
      proyecto: null,
      cargando: true,
      error: '',
      noEncontrado: false,
    })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando proyecto…')
  })

  it('muestra "no encontrado" si el proyecto no existe o es ajeno', () => {
    hooks.useProyecto.mockReturnValue({
      proyecto: null,
      cargando: false,
      error: '',
      noEncontrado: true,
    })
    renderizar()

    expect(
      screen.getByRole('heading', { name: 'Proyecto no encontrado' }),
    ).toBeInTheDocument()
  })

  it('carga los valores actuales y guarda los cambios', async () => {
    hooks.useProyecto.mockReturnValue({
      proyecto: PROYECTO,
      cargando: false,
      error: '',
      noEncontrado: false,
    })
    const usuario = userEvent.setup()
    renderizar()

    const nombre = screen.getByLabelText('Nombre')
    expect(nombre).toHaveValue('Rediseño web')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Sitio nuevo')

    await usuario.clear(nombre)
    await usuario.type(nombre, 'Rediseño 2')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Detalle p1')).toBeInTheDocument()
    expect(servicio.actualizarProyecto).toHaveBeenCalledWith(expect.anything(), 'p1', {
      nombre: 'Rediseño 2',
      descripcion: 'Sitio nuevo',
    })
  })
})