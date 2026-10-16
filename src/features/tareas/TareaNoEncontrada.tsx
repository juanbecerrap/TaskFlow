import { ListChecks } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../../components/common/EstadoVacio'
import { RUTAS } from '../../routes/rutas'

export function TareaNoEncontrada() {
  return (
    <div className="tf-card">
      <EstadoVacio
        icono={ListChecks}
        titulo="Tarea no encontrada"
        descripcion="Puede que se haya eliminado o que no tengas acceso a ella."
      >
        <Link to={RUTAS.tareas} className="btn btn-primary">
          Volver a tareas
        </Link>
      </EstadoVacio>
    </div>
  )
}