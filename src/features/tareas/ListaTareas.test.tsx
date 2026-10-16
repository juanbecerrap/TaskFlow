import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { Timestamp } from 'firebase/firestore'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import type { Tarea } from '../../types/modelos'
import { ListaTareas } from './ListaTareas'

const servicio = vi.hoisted(() => ({
  cambiarEstadoTarea: vi.fn(),
  eliminarTarea: vi.fn(),
}))

vi.mock('./servicioTareas', () => servicio)

const MARCA = Timestamp.fromDate(new Date('2026-10-14T15:00:00Z'))
const PASADA = Timestamp.fromDate(new Date(2020, 0, 15, 12))
const FUTURA = Timestamp.fromDate(new Date(2099, 11, 31, 12))

function crear(opciones: Partial<Tarea> = {}): Tarea {
  return {
    id: 't1',
    ownerId: 'u1',
    projectId: 'p1',
    titulo: 'Escribir informe',
    descripcion: '',
    estado: 'pendiente',
    prioridad: 'alta',
    fechaLimite: null,
    creadoEn: MARCA,
    actualizadoEn: MARCA,
    ...opciones,
  }
}

function renderizar(tareas: Tarea[], nombresProyecto?: Record<string, string>) {
  render(
    <MemoryRouter>
      <ListaTareas tareas={tareas} nombresProyecto={nombresProyecto} />
    </MemoryRouter>,
  )
}

describe('ListaTareas', () => {
  it('muestra título, descripción, prioridad y fecha límite', () => {
    renderizar([crear({ descripcion: 'Primera versión', fechaLimite: FUTURA })])

    expect(screen.getByText('Escribir informe')).toBeInTheDocument()
    expect(screen.getByText('Primera versión')).toBeInTheDocument()
    expect(screen.getByText('Prioridad alta')).toBeInTheDocument()
    expect(screen.getByText(/31 de diciembre de 2099/)).toBeInTheDocument()
    expect(screen.queryByText('Vencida')).not.toBeInTheDocument()
  })

  it('marca como vencida solo la tarea sin completar con fecha pasada', () => {
    renderizar([
      crear({ id: 'a', titulo: 'Vieja', fechaLimite: PASADA }),
      crear({ id: 'b', titulo: 'Hecha', estado: 'completada', fechaLimite: PASADA }),
    ])

    expect(screen.getAllByText('Vencida')).toHaveLength(1)
  })

  it('muestra el proyecto con enlace y el enlace para editar', () => {
    renderizar([crear()], { p1: 'Rediseño web' })

    expect(screen.getByRole('link', { name: 'Rediseño web' })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    )
    expect(
      screen.getByRole('link', { name: 'Editar tarea Escribir informe' }),
    ).toHaveAttribute('href', '/tareas/t1/editar')
  })

  it('cambia el estado desde el selector', async () => {
    const usuario = userEvent.setup()
    renderizar([crear()])

    await usuario.selectOptions(
      screen.getByLabelText('Estado de Escribir informe'),
      'en_progreso',
    )

    expect(servicio.cambiarEstadoTarea).toHaveBeenCalledWith(
      expect.anything(),
      't1',
      'en_progreso',
    )
  })

  it('muestra el error si no se puede cambiar el estado', async () => {
    servicio.cambiarEstadoTarea.mockRejectedValueOnce(
      new FirebaseError('unavailable', 'x'),
    )
    const usuario = userEvent.setup()
    renderizar([crear()])

    await usuario.selectOptions(
      screen.getByLabelText('Estado de Escribir informe'),
      'completada',
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El servicio no está disponible ahora. Inténtalo más tarde.',
    )
  })

  it('elimina la tarea solo tras confirmar', async () => {
    const usuario = userEvent.setup()
    renderizar([crear()])

    await usuario.click(
      screen.getByRole('button', { name: 'Eliminar tarea Escribir informe' }),
    )
    expect(servicio.eliminarTarea).not.toHaveBeenCalled()

    const dialogo = screen.getByRole('dialog', { name: 'Eliminar tarea' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }))

    expect(servicio.eliminarTarea).toHaveBeenCalledWith(expect.anything(), 't1')
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
  })

  it('cancelar el diálogo no elimina nada', async () => {
    const usuario = userEvent.setup()
    renderizar([crear()])

    await usuario.click(
      screen.getByRole('button', { name: 'Eliminar tarea Escribir informe' }),
    )
    const dialogo = screen.getByRole('dialog', { name: 'Eliminar tarea' })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))

    expect(servicio.eliminarTarea).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})