import { useNavigate } from 'react-router'
import { useAuth } from '../features/auth/useAuth'
import type { DatosProyecto } from '../features/proyectos/esquemas'
import { FormularioProyecto } from '../features/proyectos/FormularioProyecto'
import { crearProyecto } from '../features/proyectos/servicioProyectos'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { db } from '../lib/firebase'
import { RUTAS } from '../routes/rutas'

export function PaginaNuevoProyecto() {
  useTituloDocumento('Nuevo proyecto')
  const { usuario } = useAuth()
  const navegar = useNavigate()

  async function crear(datos: DatosProyecto) {
    if (!usuario) return
    const id = await crearProyecto(db, usuario.uid, datos)
    navegar(RUTAS.proyecto(id))
  }

  return (
    <section>
      <h1 className="h3 mb-4">Nuevo proyecto</h1>
      <div className="row">
        <div className="col-lg-8 col-xl-6">
          <div className="tf-card p-4">
            <FormularioProyecto
              textoEnviar="Crear proyecto"
              textoEnviando="Creando…"
              rutaCancelar={RUTAS.proyectos}
              alEnviar={crear}
            />
          </div>
        </div>
      </div>
    </section>
  )
}