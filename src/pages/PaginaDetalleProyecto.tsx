import { FolderKanban } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaDetalleProyecto() {
  useTituloDocumento('Detalle de proyecto')
  return (
    <section>
      <h1 className="h3 mb-4">Detalle de proyecto</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={FolderKanban}
          titulo="Proyecto no disponible"
          descripcion="Aquí verás la información y las tareas de cada proyecto."
        />
      </div>
    </section>
  )
}