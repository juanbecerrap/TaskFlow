import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { EstadoProyecto, Proyecto } from '../types/modelos'
import { PaginaProyectos } from './PaginaProyectos'

const hooks = vi.hoisted(() => ({ useProyectos: vi.fn() }))

vi.mock('../features/proyectos/useProyectos', () => hooks)

const FECHA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))

function crear(
  id: string,
  nombre: string,
  estado: EstadoProyecto = 'activo',
  descripcion = '',
): Proyecto {
  return {
    id,
    ownerId: 'u1',
    nombre,
    descripcion,
    estado,
    creadoEn: FECHA,
    actualizadoEn: FECHA,
  }
}

const PROYECTOS = [
  crear('p1', 'Rediseño web', 'activo', 'Sitio corporativo nuevo'),
  crear('p2', 'App móvil', 'activo', 'Versión para Android'),
  crear('p3', 'Campaña 2025', 'archivado'),
]

function conProyectos(proyectos: Proyecto[]) {
  hooks.useProyectos.mockReturnValue({ proyectos, cargando: false, error: '' })
}

function renderizar() {
  render(
    <MemoryRouter>
      <PaginaProyectos />
    </MemoryRouter>,
  )
}

describe('PaginaProyectos', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useProyectos.mockReturnValue({ proyectos: [], cargando: true, error: '' })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando proyectos…')
  })

  it('muestra el error si no se pueden cargar', () => {
    hooks.useProyectos.mockReturnValue({
      proyectos: [],
      cargando: false,
      error: 'No tienes permiso para realizar esta acción.',
    })
    renderizar()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
  })

  it('sin proyectos muestra el estado vacío con la acción de crear', () => {
    conProyectos([])
    renderizar()

    expect(
      screen.getByRole('heading', { name: 'Aún no tienes proyectos' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear proyecto' })).toHaveAttribute(
      'href',
      '/proyectos/nuevo',
    )
  })

  it('por defecto lista los activos y oculta los archivados', () => {
    conProyectos(PROYECTOS)
    renderizar()

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    )
    expect(screen.getByRole('link', { name: 'App móvil' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Campaña 2025' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 2 de 3 proyectos')
  })

  it('el filtro "Archivados" muestra los archivados', async () => {
    conProyectos(PROYECTOS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(screen.getByLabelText('Estado'), 'archivado')

    expect(screen.getByRole('link', { name: 'Campaña 2025' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Rediseño web' })).not.toBeInTheDocument()
  })

  it('la búsqueda ignora mayúsculas y acentos', async () => {
    conProyectos(PROYECTOS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Buscar proyectos'), 'REDISENO')

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'App móvil' })).not.toBeInTheDocument()
  })

  it('sin coincidencias ofrece limpiar los filtros', async () => {
    conProyectos(PROYECTOS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Buscar proyectos'), 'zzz')
    expect(
      screen.getByRole('heading', { name: 'Ningún proyecto coincide' }),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toBeInTheDocument()
    expect(screen.getByLabelText('Buscar proyectos')).toHaveValue('')
  })
})