import { fireEvent, render, screen } from '@testing-library/react'
import { FolderKanban } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'
import { EstadoVacio } from './EstadoVacio'
import { IndicadorCarga } from './IndicadorCarga'
import { MensajeError } from './MensajeError'

describe('componentes básicos', () => {
  it('EstadoVacio muestra título, descripción y acción', () => {
    render(
      <EstadoVacio
        icono={FolderKanban}
        titulo="Aún no tienes proyectos"
        descripcion="Crea el primero para empezar."
      >
        <button type="button">Crear proyecto</button>
      </EstadoVacio>,
    )
    expect(
      screen.getByRole('heading', { name: 'Aún no tienes proyectos' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Crea el primero para empezar.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear proyecto' })).toBeInTheDocument()
  })

  it('IndicadorCarga anuncia el texto como estado', () => {
    render(<IndicadorCarga texto="Cargando proyectos…" />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando proyectos…')
  })

  it('MensajeError se anuncia como alerta y permite reintentar', () => {
    const alReintentar = vi.fn()
    render(<MensajeError mensaje="No se pudo cargar." onReintentar={alReintentar} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar.')

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(alReintentar).toHaveBeenCalledTimes(1)
  })

  it('MensajeError no muestra el botón sin onReintentar', () => {
    render(<MensajeError mensaje="Algo falló." />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})