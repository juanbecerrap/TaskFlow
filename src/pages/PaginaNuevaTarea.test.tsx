import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import type { User } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { ContextoAuth } from '../features/auth/contextoAuth'
import type { Proyecto } from '../types/modelos'
import { PaginaNuevaTarea } from './PaginaNuevaTarea'

const hooks = vi.hoisted(() => ({ useProyecto: vi.fn() }))
const servicio = vi.hoisted(() => ({ crearTarea: vi.fn() }))

vi.mock('../features/proyectos/useProyecto', () => hooks)
vi.mock('../features/tareas/servicioTareas', () => servicio)

const USUARIO = { uid: 'u1' } as unknown as User
const FECHA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))

const PROYECTO: Proyecto = {
  id: 'p1',
  ownerId: 'u1',
  nombre: 'Rediseño web',
  descripcion: '',
  estado: 'activo',
  creadoEn: FECHA,
  actualizadoEn: FECHA,
}

function conProyecto() {
  hooks.useProyecto.mockReturnValue({
    proyecto: PROYECTO,
    cargando: false,
    error: '',
    noEncontrado: false,
  })
}

function renderizar() {
  render(
    <ContextoAuth.Provider value={{ usuario: USUARIO, cargando: false }}>
      <MemoryRouter initialEntries={['/proyectos/p1/tareas/nueva']}>
        <Routes>
          <Route path="/proyectos/:id/tareas/nueva" element={<PaginaNuevaTarea />} />
          <Route path="/proyectos/:id" element={<p>Detalle p1</p>} />
        </Routes>
      </MemoryRouter>
    </ContextoAuth.Provider>,
  )
}

describe('PaginaNuevaTarea', () => {
  it('muestra el indicador mientras carga el proyecto', () => {
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

  it('no envía una tarea sin título', async () => {
    conProyecto()
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByText('Escribe el título de la tarea')).toBeInTheDocument()
    expect(servicio.crearTarea).not.toHaveBeenCalled()
  })

  it('crea la tarea y vuelve al detalle del proyecto', async () => {
    conProyecto()
    servicio.crearTarea.mockResolvedValueOnce('t-nueva')
    const usuario = userEvent.setup()
    renderizar()

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    )
    await usuario.type(screen.getByLabelText('Título'), 'Escribir informe')
    await usuario.selectOptions(screen.getByLabelText('Prioridad'), 'alta')
    fireEvent.change(screen.getByLabelText('Fecha límite'), {
      target: { value: '2026-12-31' },
    })
    await usuario.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByText('Detalle p1')).toBeInTheDocument()
    expect(servicio.crearTarea).toHaveBeenCalledWith(expect.anything(), 'u1', 'p1', {
      titulo: 'Escribir informe',
      descripcion: '',
      estado: 'pendiente',
      prioridad: 'alta',
      fechaLimite: '2026-12-31',
    })
  })

  it('muestra el error si no se puede crear', async () => {
    conProyecto()
    servicio.crearTarea.mockRejectedValueOnce(
      new FirebaseError('permission-denied', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(screen.getByLabelText('Título'), 'Escribir informe')
    await usuario.click(screen.getByRole('button', { name: 'Crear tarea' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
    expect(screen.queryByText('Detalle p1')).not.toBeInTheDocument()
  })
})