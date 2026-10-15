import type { EstadoProyecto } from '../../types/modelos'

export function InsigniaEstado({ estado }: { estado: EstadoProyecto }) {
  const archivado = estado === 'archivado'
  return (
    <span className={`badge ${archivado ? 'text-bg-secondary' : 'text-bg-success'}`}>
      {archivado ? 'Archivado' : 'Activo'}
    </span>
  )
}