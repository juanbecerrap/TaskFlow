import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { EstadoTarea, PrioridadTarea, Proyecto, Tarea } from '../types/modelos'
import { PaginaTareas } from './PaginaTareas'

const hooks = vi.hoisted(() => ({ useTareas: vi.fn(), useProyectos: vi.fn() }))

vi.mock('../features/tareas/useTareas', () => ({ useTareas: hooks.useTareas }))
vi.mock('../features/proyectos/useProyectos', () => ({
  useProyectos: hooks.useProyectos,
}))

interface Opciones {
  descripcion?: string
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  fecha?: Date | null
  actualizado: number
}

function crear(id: string, titulo: string, opciones: Opciones): Tarea {
  return {
    id,
    ownerId: 'u1',
    projectId: 'p1',
    titulo,
    descripcion: opciones.descripcion ?? '',
    estado: opciones.estado ?? 'pendiente',
    prioridad: opciones.prioridad ?? 'media',
    fechaLimite: opciones.fecha ? Timestamp.fromDate(opciones.fecha) : null,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(opciones.actualizado),
  }
}

const TAREAS = [
  crear('a', 'Diseñar logo', {
    descripcion: 'Tres versiones',
    prioridad: 'alta',
    fecha: new Date(2099, 11, 31, 12),
    actualizado: 10,
  }),
  crear('b', 'Escribir pruebas', {
    estado: 'en_progreso',
    prioridad: 'baja',
    fecha: new Date(2098, 5, 1, 12),
    actualizado: 30,
  }),
  crear('c', 'Publicar sitio', {
    estado: 'completada',
    prioridad: 'alta',
    actualizado: 20,
  }),
]

const PROYECTO = { id: 'p1', nombre: 'Rediseño web' } as unknown as Proyecto

function conTareas(tareas: Tarea[]) {
  hooks.useTareas.mockReturnValue({ tareas, cargando: false, error: '' })
  hooks.useProyectos.mockReturnValue({ proyectos: [PROYECTO], cargando: false, error: '' })
}

function renderizar() {
  render(
    <MemoryRouter>
      <PaginaTareas />
    </MemoryRouter>,
  )
}

const titulosVisibles = () =>
  screen.getAllByRole('listitem').map((elemento) => elemento.textContent ?? '')

describe('PaginaTareas', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useTareas.mockReturnValue({ tareas: [], cargando: true, error: '' })
    hooks.useProyectos.mockReturnValue({ proyectos: [], cargando: true, error: '' })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tareas…')
  })

  it('muestra el error si no se pueden cargar', () => {
    hooks.useTareas.mockReturnValue({
      tareas: [],
      cargando: false,
      error: 'No tienes permiso para realizar esta acción.',
    })
    hooks.useProyectos.mockReturnValue({ proyectos: [], cargando: false, error: '' })
    renderizar()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
  })

  it('sin tareas muestra el estado vacío con enlace a proyectos', () => {
    conTareas([])
    renderizar()

    expect(screen.getByRole('heading', { name: 'Aún no tienes tareas' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a proyectos' })).toHaveAttribute(
      'href',
      '/proyectos',
    )
  })

  it('lista todas las tareas con el nombre de su proyecto', () => {
    conTareas(TAREAS)
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 3 de 3 tareas')
    expect(screen.getAllByRole('link', { name: 'Rediseño web' })).toHaveLength(3)
    expect(titulosVisibles()[0]).toContain('Escribir pruebas')
  })

  it('la búsqueda ignora mayúsculas y acentos', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Buscar tareas'), 'DISENAR')

    expect(titulosVisibles()).toHaveLength(1)
    expect(titulosVisibles()[0]).toContain('Diseñar logo')
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 1 de 3 tareas')
  })

  it('filtra por estado', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(screen.getByLabelText('Estado'), 'completada')

    expect(titulosVisibles()).toHaveLength(1)
    expect(titulosVisibles()[0]).toContain('Publicar sitio')
  })

  it('filtra por prioridad', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(screen.getByLabelText('Prioridad'), 'alta')

    const visibles = titulosVisibles()
    expect(visibles).toHaveLength(2)
    expect(visibles[0]).toContain('Publicar sitio')
    expect(visibles[1]).toContain('Diseñar logo')
  })

  it('ordena por fecha límite y deja las que no tienen fecha al final', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(screen.getByLabelText('Ordenar por'), 'fecha')

    const visibles = titulosVisibles()
    expect(visibles[0]).toContain('Escribir pruebas')
    expect(visibles[1]).toContain('Diseñar logo')
    expect(visibles[2]).toContain('Publicar sitio')
  })

  it('sin coincidencias ofrece limpiar los filtros', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Buscar tareas'), 'zzz')
    expect(screen.getByRole('heading', { name: 'Ninguna tarea coincide' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByLabelText('Buscar tareas')).toHaveValue('')
    expect(titulosVisibles()).toHaveLength(3)
  })
})