import { FolderKanban } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../../components/common/EstadoVacio'
import { RUTAS } from '../../routes/rutas'

export function ProyectoNoEncontrado() {
  return (
    <div className="tf-card">
      <EstadoVacio
        icono={FolderKanban}
        titulo="Proyecto no encontrado"
        descripcion="Puede que se haya eliminado o que no tengas acceso a él."
      >
        <Link to={RUTAS.proyectos} className="btn btn-primary">
          Volver a proyectos
        </Link>
      </EstadoVacio>
    </div>
  )
}