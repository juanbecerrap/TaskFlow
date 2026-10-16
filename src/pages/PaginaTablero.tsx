import { useMemo, useState, type DragEvent } from 'react'
import { Columns3 } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import { mensajeErrorAuth } from '../features/auth/errores'
import { useProyectos } from '../features/proyectos/useProyectos'
import { ETIQUETA_ESTADO } from '../features/tareas/etiquetas'
import { filtrarTareas, FILTROS_TAREAS_INICIALES } from '../features/tareas/filtros'
import { InsigniaPrioridad } from '../features/tareas/InsigniaPrioridad'
import { cambiarEstadoTarea } from '../features/tareas/servicioTareas'
import { useTareas } from '../features/tareas/useTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { estaVencida } from '../lib/fechas'
import { db } from '../lib/firebase'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../routes/rutas'
import { ESTADOS_TAREA, type EstadoTarea, type Tarea } from '../types/modelos'

export function PaginaTablero() {
  useTituloDocumento('Tablero')
  const { tareas, cargando, error } = useTareas()
  const { proyectos } = useProyectos()
  const [proyectoElegido, setProyectoElegido] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [anuncio, setAnuncio] = useState('')
  const [arrastrandoId, setArrastrandoId] = useState<string | null>(null)
  const [columnaSobre, setColumnaSobre] = useState<EstadoTarea | null>(null)

  // Si el proyecto elegido ya no existe, se vuelve a mostrar todo.
  const proyectoId = proyectos.some((proyecto) => proyecto.id === proyectoElegido)
    ? proyectoElegido
    : ''

  const nombresProyecto = useMemo(
    () => Object.fromEntries(proyectos.map((proyecto) => [proyecto.id, proyecto.nombre])),
    [proyectos],
  )

  const porColumna = useMemo(() => {
    const visibles = proyectoId
      ? tareas.filter((tarea) => tarea.projectId === proyectoId)
      : tareas
    return Object.fromEntries(
      ESTADOS_TAREA.map((estado) => [
        estado,
        filtrarTareas(visibles, { ...FILTROS_TAREAS_INICIALES, estado, orden: 'prioridad' }),
      ]),
    ) as Record<EstadoTarea, Tarea[]>
  }, [tareas, proyectoId])

  async function mover(tarea: Tarea, estado: EstadoTarea) {
    if (tarea.estado === estado) return
    setErrorAccion('')
    setAnuncio('')
    try {
      await cambiarEstadoTarea(db, tarea.id, estado)
      setAnuncio(`«${tarea.titulo}» movida a ${ETIQUETA_ESTADO[estado]}.`)
    } catch (fallo) {
      // Firestore revierte el cambio local; aquí solo se avisa del motivo.
      setErrorAccion(mensajeErrorAuth(fallo))
    }
  }

  function soltar(evento: DragEvent, estado: EstadoTarea) {
    evento.preventDefault()
    const tarea = tareas.find((candidata) => candidata.id === arrastrandoId)
    setArrastrandoId(null)
    setColumnaSobre(null)
    if (tarea) void mover(tarea, estado)
  }

  function contenido() {
    if (cargando) return <IndicadorCarga texto="Cargando tablero…" />
    if (error) return <MensajeError mensaje={error} />

    if (tareas.length === 0) {
      return (
        <div className="tf-card">
          <EstadoVacio
            icono={Columns3}
            titulo="Aún no tienes tareas"
            descripcion="Las tareas se crean dentro de un proyecto. Abre uno y añade la primera."
          >
            <Link to={RUTAS.proyectos} className="btn btn-primary">
              Ir a proyectos
            </Link>
          </EstadoVacio>
        </div>
      )
    }

    return (
      <>
        <div className="row g-3 align-items-end mb-3">
          <div className="col-md-6 col-lg-4">
            <label htmlFor="filtro-proyecto" className="form-label">
              Proyecto
            </label>
            <select
              id="filtro-proyecto"
              className="form-select"
              value={proyectoId}
              onChange={(evento) => setProyectoElegido(evento.target.value)}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-body-secondary small">
          Arrastra una tarea a otra columna o usa el selector de estado de cada tarjeta.
        </p>

        {errorAccion && (
          <div className="mb-3">
            <MensajeError mensaje={errorAccion} />
          </div>
        )}
        <p role="status" className="visually-hidden">
          {anuncio}
        </p>

        <div className="row g-3">
          {ESTADOS_TAREA.map((estado) => {
            const columna = porColumna[estado]
            const idTitulo = `columna-${estado}`
            return (
              <div key={estado} className="col-12 col-lg-4">
                <section
                  aria-labelledby={idTitulo}
                  className="tf-card p-3 h-100"
                  style={
                    columnaSobre === estado
                      ? { outline: '2px dashed var(--bs-primary)' }
                      : undefined
                  }
                  onDragOver={(evento) => {
                    evento.preventDefault()
                    if (columnaSobre !== estado) setColumnaSobre(estado)
                  }}
                  onDragLeave={(evento) => {
                    if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
                      setColumnaSobre(null)
                    }
                  }}
                  onDrop={(evento) => soltar(evento, estado)}
                >
                  <h2
                    id={idTitulo}
                    className="h6 d-flex align-items-center justify-content-between mb-3"
                  >
                    {ETIQUETA_ESTADO[estado]}{' '}
                    <span className="badge text-bg-secondary">{columna.length}</span>
                  </h2>

                  {columna.length === 0 ? (
                    <p className="text-body-secondary small mb-0">Sin tareas.</p>
                  ) : (
                    <ul className="list-unstyled mb-0 d-grid gap-2">
                      {columna.map((tarea) => (
                        <li key={tarea.id}>
                          <article
                            className="tf-card p-3"
                            draggable
                            style={{
                              cursor: 'grab',
                              opacity: arrastrandoId === tarea.id ? 0.5 : 1,
                            }}
                            onDragStart={(evento) => {
                              evento.dataTransfer.setData('text/plain', tarea.id)
                              evento.dataTransfer.effectAllowed = 'move'
                              setArrastrandoId(tarea.id)
                            }}
                            onDragEnd={() => {
                              setArrastrandoId(null)
                              setColumnaSobre(null)
                            }}
                          >
                            <p className="fw-semibold mb-1">{tarea.titulo}</p>
                            {nombresProyecto[tarea.projectId] && (
                              <p className="small mb-2">
                                <Link to={RUTAS.proyecto(tarea.projectId)}>
                                  {nombresProyecto[tarea.projectId]}
                                </Link>
                              </p>
                            )}
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
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
                            <label htmlFor={`mover-${tarea.id}`} className="visually-hidden">
                              Estado de {tarea.titulo}
                            </label>
                            <select
                              id={`mover-${tarea.id}`}
                              className="form-select form-select-sm"
                              value={tarea.estado}
                              onChange={(evento) =>
                                mover(tarea, evento.target.value as EstadoTarea)
                              }
                            >
                              {ESTADOS_TAREA.map((opcion) => (
                                <option key={opcion} value={opcion}>
                                  {ETIQUETA_ESTADO[opcion]}
                                </option>
                              ))}
                            </select>
                          </article>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-4">Tablero</h1>
      {contenido()}
    </section>
  )
}