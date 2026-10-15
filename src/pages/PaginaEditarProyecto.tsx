import { useNavigate, useParams } from 'react-router'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import type { DatosProyecto } from '../features/proyectos/esquemas'
import { FormularioProyecto } from '../features/proyectos/FormularioProyecto'
import { ProyectoNoEncontrado } from '../features/proyectos/ProyectoNoEncontrado'
import { actualizarProyecto } from '../features/proyectos/servicioProyectos'
import { useProyecto } from '../features/proyectos/useProyecto'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { db } from '../lib/firebase'
import { RUTAS } from '../routes/rutas'

export function PaginaEditarProyecto() {
  useTituloDocumento('Editar proyecto')
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const { proyecto, cargando, error, noEncontrado } = useProyecto(id)

  async function guardar(datos: DatosProyecto) {
    await actualizarProyecto(db, id, datos)
    navegar(RUTAS.proyecto(id))
  }

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando proyecto…" />
    if (error) return <MensajeError mensaje={error} />
    if (noEncontrado || !proyecto) return <ProyectoNoEncontrado />
    return (
      <div className="row">
        <div className="col-lg-8 col-xl-6">
          <div className="tf-card p-4">
            <FormularioProyecto
              key={proyecto.id}
              valoresIniciales={{
                nombre: proyecto.nombre,
                descripcion: proyecto.descripcion,
              }}
              textoEnviar="Guardar cambios"
              textoEnviando="Guardando…"
              rutaCancelar={RUTAS.proyecto(id)}
              alEnviar={guardar}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-4">Editar proyecto</h1>
      {contenido()}
    </section>
  )
}