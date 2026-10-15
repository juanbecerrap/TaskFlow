import { ListChecks } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaTareas() {
  useTituloDocumento('Tareas')
  return (
    <section>
      <h1 className="h3 mb-4">Tareas</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={ListChecks}
          titulo="Aún no tienes tareas"
          descripcion="Aquí aparecerán todas tus tareas, con filtros por estado y prioridad."
        />
      </div>
    </section>
  )
}