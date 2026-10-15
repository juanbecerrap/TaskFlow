import { User } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaPerfil() {
  useTituloDocumento('Perfil')
  return (
    <section>
      <h1 className="h3 mb-4">Perfil</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={User}
          titulo="Perfil no disponible"
          descripcion="Aquí podrás ver y editar tus datos cuando inicies sesión."
        />
      </div>
    </section>
  )
}