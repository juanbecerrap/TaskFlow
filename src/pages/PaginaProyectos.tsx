import { FolderKanban } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaProyectos() {
  useTituloDocumento('Proyectos')
  return (
    <section>
      <h1 className="h3 mb-4">Proyectos</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={FolderKanban}
          titulo="Aún no tienes proyectos"
          descripcion="La gestión de proyectos se activa cuando conectemos tu cuenta."
        />
      </div>
    </section>
  )
}