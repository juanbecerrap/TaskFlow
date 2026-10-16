import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import '../../components/common/common.css'
import { MensajeError } from '../../components/common/MensajeError'
import { ModalConfirmacion } from '../../components/common/ModalConfirmacion'
import { estaVencida } from '../../lib/fechas'
import { db } from '../../lib/firebase'
import { formatearFecha } from '../../lib/formato'
import { RUTAS } from '../../routes/rutas'
import { ESTADOS_TAREA, type EstadoTarea, type Tarea } from '../../types/modelos'
import { mensajeErrorAuth } from '../auth/errores'
import { ETIQUETA_ESTADO } from './etiquetas'
import { InsigniaPrioridad } from './InsigniaPrioridad'
import { cambiarEstadoTarea, eliminarTarea } from './servicioTareas'

interface ListaTareasProps {
  tareas: Tarea[]
  // Si se entrega, cada tarea muestra el nombre de su proyecto con un enlace.
  nombresProyecto?: Record<string, string>
}

export function ListaTareas({ tareas, nombresProyecto }: ListaTareasProps) {
  const [errorAccion, setErrorAccion] = useState('')
  const [cambiandoId, setCambiandoId] = useState<string | null>(null)
  const [porEliminar, setPorEliminar] = useState<Tarea | null>(null)
  const [eliminando, setEliminando] = useState(false)

  async function cambiarEstado(tarea: Tarea, estado: EstadoTarea) {
    setErrorAccion('')
    setCambiandoId(tarea.id)
    try {
      await cambiarEstadoTarea(db, tarea.id, estado)
    } catch (fallo) {
      setErrorAccion(mensajeErrorAuth(fallo))
    } finally {
      setCambiandoId(null)
    }
  }

  async function eliminar() {
    if (!porEliminar) return
    setErrorAccion('')
    setEliminando(true)
    try {
      await eliminarTarea(db, porEliminar.id)
    } catch (fallo) {
      setErrorAccion(mensajeErrorAuth(fallo))
    } finally {
      setEliminando(false)
      setPorEliminar(null)
    }
  }

  return (
    <>
      {errorAccion && (
        <div className="mb-3">
          <MensajeError mensaje={errorAccion} />
        </div>
      )}

      <ul className="list-unstyled mb-0 d-grid gap-2">
        {tareas.map((tarea) => {
          const completada = tarea.estado === 'completada'
          const nombreProyecto = nombresProyecto?.[tarea.projectId]
          return (
            <li key={tarea.id}>
              <article className="tf-card p-3">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                  <div className="flex-grow-1">
                    <p
                      className={`fw-semibold mb-1${
                        completada ? ' text-decoration-line-through text-body-secondary' : ''
                      }`}
                    >
                      {tarea.titulo}
                    </p>
                    {nombreProyecto && (
                      <p className="small mb-1">
                        <Link to={RUTAS.proyecto(tarea.projectId)}>{nombreProyecto}</Link>
                      </p>
                    )}
                    {tarea.descripcion && (
                      <p className="text-body-secondary small tf-clamp mb-2">
                        {tarea.descripcion}
                      </p>
                    )}
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <InsigniaPrioridad prioridad={tarea.prioridad} />
                      {tarea.fechaLimite && (
                        <span className="small text-body-secondary">
                          Vence el {formatearFecha(tarea.fechaLimite.toDate())}
                        </span>
                      )}
                      {estaVencida(tarea) && (
                        <span className="badge text-bg-danger">Vencida</span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <label htmlFor={`estado-${tarea.id}`} className="visually-hidden">
                      Estado de {tarea.titulo}
                    </label>
                    <select
                      id={`estado-${tarea.id}`}
                      className="form-select form-select-sm w-auto"
                      value={tarea.estado}
                      disabled={cambiandoId === tarea.id}
                      onChange={(evento) =>
                        cambiarEstado(tarea, evento.target.value as EstadoTarea)
                      }
                    >
                      {ESTADOS_TAREA.map((estado) => (
                        <option key={estado} value={estado}>
                          {ETIQUETA_ESTADO[estado]}
                        </option>
                      ))}
                    </select>
                    <Link
                      to={RUTAS.editarTarea(tarea.id)}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                      aria-label={`Editar tarea ${tarea.titulo}`}
                    >
                      <Pencil aria-hidden="true" size={16} />
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                      aria-label={`Eliminar tarea ${tarea.titulo}`}
                      onClick={() => setPorEliminar(tarea)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      <ModalConfirmacion
        abierto={porEliminar !== null}
        titulo="Eliminar tarea"
        mensaje={`Se eliminará «${porEliminar?.titulo ?? ''}». Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        cargando={eliminando}
        onConfirmar={eliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </>
  )
}