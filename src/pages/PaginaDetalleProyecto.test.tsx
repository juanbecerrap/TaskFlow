import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ContextoAuth } from '../features/auth/contextoAuth'
import type { Proyecto, Tarea } from '../types/modelos'
import { PaginaDetalleProyecto } from './PaginaDetalleProyecto'

const hooks = vi.hoisted(() => ({ useProyecto: vi.fn() }))
const hooksTareas = vi.hoisted(() => ({ useTareas: vi.fn() }))
const servicio = vi.hoisted(() => ({
  cambiarEstadoProyecto: vi.fn(),
  eliminarProyecto: vi.fn(),
}))

vi.mock('../features/proyectos/useProyecto', () => hooks)
vi.mock('../features/tareas/useTareas', () => hooksTareas)
vi.mock('../features/proyectos/servicioProyectos', () => servicio)

const USUARIO = { uid: 'u1' } as unknown as User
const FECHA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))

const PROYECTO: Proyecto = {
  id: 'p1',
  ownerId: 'u1',
  nombre: 'Rediseño web',
  descripcion: 'Sitio corporativo nuevo',
  estado: 'activo',
  creadoEn: FECHA,
  actualizadoEn: FECHA,
}

const TAREA: Tarea = {
  id: 't1',
  ownerId: 'u1',
  projectId: 'p1',
  titulo: 'Escribir informe',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'alta',
  fechaLimite: null,
  creadoEn: FECHA,
  actualizadoEn: FECHA,
}

function resultado(proyecto: Proyecto | null) {
  return { proyecto, cargando: false, error: '', noEncontrado: false }
}

function renderizar() {
  render(
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      <MemoryRouter initialEntries={['/proyectos/p1']}>
        <Routes>
          <Route path="/proyectos/:id" element={<PaginaDetalleProyecto />} />
          <Route path="/proyectos" element={<p>Pantalla de lista</p>} />
        </Routes>
      </MemoryRouter>
    </ContextoAuth.Provider>,
  )
}

describe('PaginaDetalleProyecto', () => {
  beforeEach(() => {
    hooksTareas.useTareas.mockReturnValue({ tareas: [], cargando: false, error: '' })
  })

  it('muestra el indicador mientras carga', () => {
    hooks.useProyecto.mockReturnValue({
      proyecto: null,
      cargando: true,
      error: '',
      noEncontrado: false,
    })
    renderizar()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Detalle de proyecto' }),
    ).toBeInTheDocument()
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
    expect(screen.getByRole('link', { name: 'Volver a proyectos' })).toHaveAttribute(
      'href',
      '/proyectos',
    )
  })

  it('muestra los datos reales del proyecto y sus acciones', () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    renderizar()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Rediseño web' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Sitio corporativo nuevo')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText(/14 de octubre de 2026/, { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute(
      'href',
      '/proyectos/p1/editar',
    )
  })

  it('sin tareas muestra el estado vacío y el enlace para crear una', () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    renderizar()

    expect(
      screen.getByRole('heading', { name: 'Este proyecto aún no tiene tareas' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nueva tarea' })).toHaveAttribute(
      'href',
      '/proyectos/p1/tareas/nueva',
    )
  })

  it('lista las tareas del proyecto', () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    hooksTareas.useTareas.mockReturnValue({ tareas: [TAREA], cargando: false, error: '' })
    renderizar()

    expect(hooksTareas.useTareas).toHaveBeenCalledWith('p1')
    expect(screen.getByText('Escribir informe')).toBeInTheDocument()
    expect(screen.getByText('Prioridad alta')).toBeInTheDocument()
  })

  it('muestra el error si no se pueden cargar las tareas', () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    hooksTareas.useTareas.mockReturnValue({
      tareas: [],
      cargando: false,
      error: 'No tienes permiso para realizar esta acción.',
    })
    renderizar()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
  })

  it('archiva un proyecto activo', async () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Archivar' }))

    expect(servicio.cambiarEstadoProyecto).toHaveBeenCalledWith(
      expect.anything(),
      'p1',
      'archivado',
    )
  })

  it('reactiva un proyecto archivado', async () => {
    hooks.useProyecto.mockReturnValue(resultado({ ...PROYECTO, estado: 'archivado' }))
    const usuario = userEvent.setup()
    renderizar()

    expect(screen.getByText('Archivado')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Reactivar' }))

    expect(servicio.cambiarEstadoProyecto).toHaveBeenCalledWith(
      expect.anything(),
      'p1',
      'activo',
    )
  })

  it('elimina el proyecto solo tras confirmar y vuelve a la lista', async () => {
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(servicio.eliminarProyecto).not.toHaveBeenCalled()

    const dialogo = screen.getByRole('dialog', { name: 'Eliminar proyecto' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Pantalla de lista')).toBeInTheDocument()
    expect(servicio.eliminarProyecto).toHaveBeenCalledWith(
      expect.anything(),
      'u1',
      'p1',
    )
  })

  it('muestra el error si no se puede eliminar y cierra el diálogo', async () => {
    servicio.eliminarProyecto.mockRejectedValueOnce(
      new FirebaseError('permission-denied', 'x'),
    )
    hooks.useProyecto.mockReturnValue(resultado(PROYECTO))
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }))
    const dialogo = screen.getByRole('dialog', { name: 'Eliminar proyecto' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})