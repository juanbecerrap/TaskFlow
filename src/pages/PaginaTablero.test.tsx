import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { EstadoTarea, PrioridadTarea, Proyecto, Tarea } from '../types/modelos'
import { PaginaTablero } from './PaginaTablero'

const hooks = vi.hoisted(() => ({ useTareas: vi.fn(), useProyectos: vi.fn() }))
const servicio = vi.hoisted(() => ({ cambiarEstadoTarea: vi.fn() }))

vi.mock('../features/tareas/useTareas', () => ({ useTareas: hooks.useTareas }))
vi.mock('../features/proyectos/useProyectos', () => ({
  useProyectos: hooks.useProyectos,
}))
vi.mock('../features/tareas/servicioTareas', () => servicio)

function tarea(
  id: string,
  titulo: string,
  projectId: string,
  estado: EstadoTarea,
  prioridad: PrioridadTarea,
): Tarea {
  return {
    id,
    ownerId: 'u1',
    projectId,
    titulo,
    descripcion: '',
    estado,
    prioridad,
    fechaLimite: null,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(1),
  }
}

const TAREAS = [
  tarea('a', 'Entregar informe', 'p1', 'pendiente', 'alta'),
  tarea('b', 'Revisar diseño', 'p1', 'en_progreso', 'media'),
  tarea('c', 'Publicar sitio', 'p2', 'completada', 'baja'),
  tarea('d', 'Escribir pruebas', 'p2', 'pendiente', 'baja'),
]

function proyecto(id: string, nombre: string): Proyecto {
  return {
    id,
    ownerId: 'u1',
    nombre,
    descripcion: '',
    estado: 'activo',
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(1),
  }
}

const PROYECTOS = [proyecto('p1', 'Rediseño web'), proyecto('p2', 'App móvil')]

function conTareas(tareas: Tarea[]) {
  hooks.useTareas.mockReturnValue({ tareas, cargando: false, error: '' })
  hooks.useProyectos.mockReturnValue({ proyectos: PROYECTOS, cargando: false, error: '' })
}

function renderizar() {
  render(
    <MemoryRouter>
      <PaginaTablero />
    </MemoryRouter>,
  )
}

const columna = (nombre: RegExp) => screen.getByRole('region', { name: nombre })

describe('PaginaTablero', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useTareas.mockReturnValue({ tareas: [], cargando: true, error: '' })
    hooks.useProyectos.mockReturnValue({ proyectos: [], cargando: true, error: '' })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tablero…')
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

  it('reparte las tareas en tres columnas, las de prioridad alta primero', () => {
    conTareas(TAREAS)
    renderizar()

    const pendiente = columna(/^Pendiente/)
    const elementos = within(pendiente).getAllByRole('listitem')
    expect(elementos).toHaveLength(2)
    expect(elementos[0]).toHaveTextContent('Entregar informe')
    expect(elementos[1]).toHaveTextContent('Escribir pruebas')

    expect(within(columna(/^En progreso/)).getByText('Revisar diseño')).toBeInTheDocument()
    expect(within(columna(/^Completada/)).getByText('Publicar sitio')).toBeInTheDocument()
  })

  it('filtra el tablero por proyecto', async () => {
    conTareas(TAREAS)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(screen.getByLabelText('Proyecto'), 'p2')

    expect(screen.getByText('Escribir pruebas')).toBeInTheDocument()
    expect(screen.getByText('Publicar sitio')).toBeInTheDocument()
    expect(screen.queryByText('Entregar informe')).not.toBeInTheDocument()
    expect(within(columna(/^En progreso/)).getByText('Sin tareas.')).toBeInTheDocument()
  })

  it('cambia el estado con el selector y lo anuncia', async () => {
    conTareas(TAREAS)
    servicio.cambiarEstadoTarea.mockResolvedValueOnce(undefined)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(
      screen.getByLabelText('Estado de Entregar informe'),
      'completada',
    )

    expect(servicio.cambiarEstadoTarea).toHaveBeenCalledWith(
      expect.anything(),
      'a',
      'completada',
    )
    expect(await screen.findByText('«Entregar informe» movida a Completada.')).toBeInTheDocument()
  })

  it('muestra el error si no se puede mover la tarea', async () => {
    conTareas(TAREAS)
    servicio.cambiarEstadoTarea.mockRejectedValueOnce(
      new FirebaseError('permission-denied', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar()

    await usuario.selectOptions(
      screen.getByLabelText('Estado de Entregar informe'),
      'en_progreso',
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
  })

  it('arrastrar una tarea a otra columna cambia su estado', () => {
    conTareas(TAREAS)
    renderizar()
    const transferencia = { setData: vi.fn(), effectAllowed: 'move', dropEffect: 'move' }

    const tarjeta = screen.getByText('Entregar informe').closest('article') as HTMLElement
    fireEvent.dragStart(tarjeta, { dataTransfer: transferencia })
    fireEvent.drop(columna(/^En progreso/), { dataTransfer: transferencia })

    expect(servicio.cambiarEstadoTarea).toHaveBeenCalledWith(
      expect.anything(),
      'a',
      'en_progreso',
    )
  })

  it('soltar en la misma columna no cambia nada', () => {
    conTareas(TAREAS)
    renderizar()
    const transferencia = { setData: vi.fn(), effectAllowed: 'move', dropEffect: 'move' }

    const tarjeta = screen.getByText('Entregar informe').closest('article') as HTMLElement
    fireEvent.dragStart(tarjeta, { dataTransfer: transferencia })
    fireEvent.drop(columna(/^Pendiente/), { dataTransfer: transferencia })

    expect(servicio.cambiarEstadoTarea).not.toHaveBeenCalled()
  })
})