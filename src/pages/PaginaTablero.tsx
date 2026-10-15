import { Columns3 } from 'lucide-react'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

export function PaginaTablero() {
  useTituloDocumento('Tablero')
  return (
    <section>
      <h1 className="h3 mb-4">Tablero</h1>
      <div className="tf-card">
        <EstadoVacio
          icono={Columns3}
          titulo="Tu tablero está vacío"
          descripcion="Cuando tengas tareas, podrás organizarlas por columnas de estado."
        />
      </div>
    </section>
  )
}