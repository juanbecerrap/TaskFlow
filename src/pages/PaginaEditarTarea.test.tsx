import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Tarea } from '../types/modelos'
import { PaginaEditarTarea } from './PaginaEditarTarea'

const hooks = vi.hoisted(() => ({ useTareas: vi.fn() }))
const servicio = vi.hoisted(() => ({ actualizarTarea: vi.fn() }))

vi.mock('../features/tareas/useTareas', () => hooks)
vi.mock('../features/tareas/servicioTareas', () => servicio)

const MARCA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))

const TAREA: Tarea = {
  id: 't1',
  ownerId: 'u1',
  projectId: 'p1',
  titulo: 'Escribir informe',
  descripcion: 'Primera versión',
  estado: 'pendiente',
  prioridad: 'alta',
  fechaLimite: Timestamp.fromDate(new Date(2026, 11, 31, 12)),
  creadoEn: MARCA,
  actualizadoEn: MARCA,
}

function conTareas(tareas: Tarea[]) {
  hooks.useTareas.mockReturnValue({ tareas, cargando: false, error: '' })
}

function renderizar() {
  render(
    <MemoryRouter initialEntries={['/tareas/t1/editar']}>
      <Routes>
        <Route path="/tareas/:id/editar" element={<PaginaEditarTarea />} />
        <Route path="/proyectos/:id" element={<p>Detalle p1</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PaginaEditarTarea', () => {
  it('muestra el indicador mientras carga', () => {
    hooks.useTareas.mockReturnValue({ tareas: [], cargando: true, error: '' })
    renderizar()

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tarea…')
  })

  it('muestra "no encontrada" si la tarea no existe o es ajena', () => {
    conTareas([])
    renderizar()

    expect(screen.getByRole('heading', { name: 'Tarea no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver a tareas' })).toHaveAttribute(
      'href',
      '/tareas',
    )
  })

  it('carga los valores actuales y guarda los cambios', async () => {
    conTareas([TAREA])
    const usuario = userEvent.setup()
    renderizar()

    const titulo = screen.getByLabelText('Título')
    expect(titulo).toHaveValue('Escribir informe')
    expect(screen.getByLabelText('Descripción')).toHaveValue('Primera versión')
    expect(screen.getByLabelText('Estado')).toHaveValue('pendiente')
    expect(screen.getByLabelText('Prioridad')).toHaveValue('alta')
    expect(screen.getByLabelText('Fecha límite')).toHaveValue('2026-12-31')

    await usuario.clear(titulo)
    await usuario.type(titulo, 'Escribir informe 2')
    await usuario.selectOptions(screen.getByLabelText('Estado'), 'en_progreso')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Detalle p1')).toBeInTheDocument()
    expect(servicio.actualizarTarea).toHaveBeenCalledWith(expect.anything(), 't1', {
      titulo: 'Escribir informe 2',
      descripcion: 'Primera versión',
      estado: 'en_progreso',
      prioridad: 'alta',
      fechaLimite: '2026-12-31',
    })
  })

  it('muestra el error si no se puede guardar', async () => {
    conTareas([TAREA])
    servicio.actualizarTarea.mockRejectedValueOnce(
      new FirebaseError('permission-denied', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar()

    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para realizar esta acción.',
    )
    expect(screen.queryByText('Detalle p1')).not.toBeInTheDocument()
  })
})