import { useNavigate, useParams } from 'react-router'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import type { DatosTarea } from '../features/tareas/esquemas'
import { FormularioTarea } from '../features/tareas/FormularioTarea'
import { actualizarTarea } from '../features/tareas/servicioTareas'
import { TareaNoEncontrada } from '../features/tareas/TareaNoEncontrada'
import { useTareas } from '../features/tareas/useTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { fechaATexto } from '../lib/fechas'
import { db } from '../lib/firebase'
import { RUTAS } from '../routes/rutas'

export function PaginaEditarTarea() {
  useTituloDocumento('Editar tarea')
  const { id = '' } = useParams()
  const navegar = useNavigate()
  const { tareas, cargando, error } = useTareas()
  const tarea = tareas.find((candidata) => candidata.id === id)

  async function guardar(datos: DatosTarea) {
    if (!tarea) return
    await actualizarTarea(db, tarea.id, datos)
    navegar(RUTAS.proyecto(tarea.projectId))
  }

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando tarea…" />
    if (error) return <MensajeError mensaje={error} />
    if (!tarea) return <TareaNoEncontrada />
    return (
      <div className="row">
        <div className="col-lg-8 col-xl-6">
          <div className="tf-card p-4">
            <FormularioTarea
              key={tarea.id}
              valoresIniciales={{
                titulo: tarea.titulo,
                descripcion: tarea.descripcion,
                estado: tarea.estado,
                prioridad: tarea.prioridad,
                fechaLimite: fechaATexto(tarea.fechaLimite),
              }}
              textoEnviar="Guardar cambios"
              textoEnviando="Guardando…"
              rutaCancelar={RUTAS.proyecto(tarea.projectId)}
              alEnviar={guardar}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-4">Editar tarea</h1>
      {contenido()}
    </section>
  )
}