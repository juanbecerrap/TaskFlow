import { Link, useNavigate, useParams } from 'react-router'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import { useAuth } from '../features/auth/useAuth'
import { ProyectoNoEncontrado } from '../features/proyectos/ProyectoNoEncontrado'
import { useProyecto } from '../features/proyectos/useProyecto'
import type { DatosTarea } from '../features/tareas/esquemas'
import { FormularioTarea } from '../features/tareas/FormularioTarea'
import { crearTarea } from '../features/tareas/servicioTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { db } from '../lib/firebase'
import { RUTAS } from '../routes/rutas'

export function PaginaNuevaTarea() {
  useTituloDocumento('Nueva tarea')
  const { id = '' } = useParams()
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const { proyecto, cargando, error, noEncontrado } = useProyecto(id)

  async function crear(datos: DatosTarea) {
    if (!usuario) return
    await crearTarea(db, usuario.uid, id, datos)
    navegar(RUTAS.proyecto(id))
  }

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando proyecto…" />
    if (error) return <MensajeError mensaje={error} />
    if (noEncontrado || !proyecto) return <ProyectoNoEncontrado />
    return (
      <>
        <p className="text-body-secondary">
          Proyecto: <Link to={RUTAS.proyecto(proyecto.id)}>{proyecto.nombre}</Link>
        </p>
        <div className="row">
          <div className="col-lg-8 col-xl-6">
            <div className="tf-card p-4">
              <FormularioTarea
                textoEnviar="Crear tarea"
                textoEnviando="Creando…"
                rutaCancelar={RUTAS.proyecto(id)}
                alEnviar={crear}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-3">Nueva tarea</h1>
      {contenido()}
    </section>
  )
}