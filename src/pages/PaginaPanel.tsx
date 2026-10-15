import { LayoutDashboard } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaPanel() {
  useTituloDocumento('Panel')
  return (
    <section>
      <h1 className="h3 mb-4">Panel</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={LayoutDashboard}
          titulo="Aún no hay datos para mostrar"
          descripcion="Cuando crees proyectos y tareas, aquí verás tu resumen real."
        />
      </div>
    </section>
  )
}