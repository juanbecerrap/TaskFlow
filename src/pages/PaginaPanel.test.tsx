import { render, screen } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ContextoAuth } from '../features/auth/contextoAuth'
import type { EstadoProyecto, EstadoTarea, Proyecto, Tarea } from '../types/modelos'
import { PaginaPanel } from './PaginaPanel'

const hooks = vi.hoisted(() => ({ useTareas: vi.fn(), useProyectos: vi.fn() }))

vi.mock('../features/tareas/useTareas', () => ({ useTareas: hooks.useTareas }))
vi.mock('../features/proyectos/useProyectos', () => ({
  useProyectos: hooks.useProyectos,
}))

const USUARIO = { uid: 'u1', displayName: 'Ana María' } as unknown as User
const PASADA = Timestamp.fromDate(new Date(2020, 0, 15, 12))
const FUTURA = Timestamp.fromDate(new Date(2099, 11, 31, 12))

function tarea(
  id: string,
  titulo: string,
  projectId: string,
  estado: EstadoTarea,
  fechaLimite: Timestamp | null,
): Tarea {
  return {
    id,
    ownerId: 'u1',
    projectId,
    titulo,
    descripcion: '',
    estado,
    prioridad: 'media',
    fechaLimite,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(1),
  }
}

function proyecto(
  id: string,
  nombre: string,
  estado: EstadoProyecto,
  actualizado: number,
): Proyecto {
  return {
    id,
    ownerId: 'u1',
    nombre,
    descripcion: '',
    estado,
    creadoEn: Timestamp.fromMillis(1),
    actualizadoEn: Timestamp.fromMillis(actualizado),
  }
}

const TAREAS = [
  tarea('a', 'Entregar informe', 'p1', 'pendiente', PASADA),
  tarea('b', 'Revisar diseño', 'p1', 'en_progreso', FUTURA),
  tarea('c', 'Publicar sitio', 'p2', 'completada', null),
]

const PROYECTOS = [
  proyecto('p1', 'Rediseño web', 'activo', 30),
  proyecto('p2', 'App móvil', 'activo', 20),
  proyecto('p3', 'Campaña vieja', 'archivado', 10),
]

function conDatos(tareas: Tarea[], proyectos: Proyecto[]) {
  hooks.useTareas.mockReturnValue({ tareas, cargando: false, error: '' })
  hooks.useProyectos.mockReturnValue({ proyectos, cargando: false, error: '' })
}

function renderizar() {
  render(
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      <MemoryRouter>
        <PaginaPanel />
      </MemoryRouter>
    </ContextoAuth.Provider>,
  )
}

describe('PaginaPanel', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useTareas.mockReturnValue({ tareas: [], cargando: true, error: '' })
    hooks.useProyectos.mockReturnValue({ proyectos: [], cargando: true, error: '' })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando resumen…')
  })

  it('muestra el error si no se pueden cargar los datos', () => {
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

  it('sin datos muestra el estado vacío con la acción de crear un proyecto', () => {
    conDatos([], [])
    renderizar()

    expect(
      screen.getByRole('heading', { name: 'Aún no hay datos para mostrar' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear proyecto' })).toHaveAttribute(
      'href',
      '/proyectos/nuevo',
    )
  })

  it('saluda con el primer nombre', () => {
    conDatos(TAREAS, PROYECTOS)
    renderizar()

    expect(screen.getByRole('heading', { level: 1, name: 'Panel' })).toBeInTheDocument()
    expect(screen.getByText(/Hola, Ana\./)).toBeInTheDocument()
  })

  it('muestra las estadísticas reales y el progreso', () => {
    conDatos(TAREAS, PROYECTOS)
    renderizar()

    const tarjeta = (titulo: string) => screen.getByText(titulo).closest('li')
    expect(tarjeta('Proyectos activos')).toHaveTextContent(/^Proyectos activos2$/)
    expect(tarjeta('Tareas pendientes')).toHaveTextContent(/^Tareas pendientes2$/)
    expect(tarjeta('Completadas')).toHaveTextContent(/^Completadas1$/)
    expect(tarjeta('Vencidas')).toHaveTextContent(/^Vencidas1$/)

    expect(screen.getByRole('progressbar', { name: 'Progreso de tareas' })).toHaveAttribute(
      'aria-valuenow',
      '33',
    )
    expect(screen.getByText('1 de 3 tareas completadas (33 %)')).toBeInTheDocument()
  })

  it('lista las próximas tareas con su proyecto y marca las vencidas', () => {
    conDatos(TAREAS, PROYECTOS)
    renderizar()

    expect(screen.getByRole('link', { name: 'Entregar informe' })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    )
    expect(screen.getByRole('link', { name: 'Revisar diseño' })).toBeInTheDocument()
    expect(screen.queryByText('Publicar sitio')).not.toBeInTheDocument()
    expect(screen.getAllByText('Vencida')).toHaveLength(1)
  })

  it('muestra los proyectos recientes activos y los accesos rápidos', () => {
    conDatos(TAREAS, PROYECTOS)
    renderizar()

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    )
    expect(screen.getByRole('link', { name: 'App móvil' })).toBeInTheDocument()
    expect(screen.queryByText('Campaña vieja')).not.toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Nuevo proyecto' })).toHaveAttribute(
      'href',
      '/proyectos/nuevo',
    )
    expect(screen.getByRole('link', { name: 'Ver proyectos' })).toHaveAttribute(
      'href',
      '/proyectos',
    )
    expect(screen.getByRole('link', { name: 'Ver tareas' })).toHaveAttribute('href', '/tareas')
  })
})