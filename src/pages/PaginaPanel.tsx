import { useMemo } from 'react'
import { LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router'
import { EstadoVacio } from '../components/common/EstadoVacio'
import { IndicadorCarga } from '../components/common/IndicadorCarga'
import { MensajeError } from '../components/common/MensajeError'
import { useAuth } from '../features/auth/useAuth'
import { calcularResumen } from '../features/panel/resumen'
import { useProyectos } from '../features/proyectos/useProyectos'
import { useTareas } from '../features/tareas/useTareas'
import { useTituloDocumento } from '../hooks/useTituloDocumento'
import { estaVencida } from '../lib/fechas'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../routes/rutas'

export function PaginaPanel() {
  useTituloDocumento('Panel')
  const { usuario } = useAuth()
  const { tareas, cargando: cargandoTareas, error: errorTareas } = useTareas()
  const {
    proyectos,
    cargando: cargandoProyectos,
    error: errorProyectos,
  } = useProyectos()

  const resumen = useMemo(() => calcularResumen(tareas, proyectos), [tareas, proyectos])
  const nombresProyecto = useMemo(
    () => Object.fromEntries(proyectos.map((proyecto) => [proyecto.id, proyecto.nombre])),
    [proyectos],
  )

  const primerNombre = usuario?.displayName?.trim().split(/\s+/)[0]
  const saludo = primerNombre ? `Hola, ${primerNombre}.` : 'Hola.'

  function contenido() {
    if (cargandoTareas || cargandoProyectos) {
      return <IndicadorCarga texto="Cargando resumen…" />
    }
    const error = errorTareas || errorProyectos
    if (error) return <MensajeError mensaje={error} />

    if (proyectos.length === 0 && tareas.length === 0) {
      return (
        <div className="tf-card">
          <EstadoVacio
            icono={LayoutDashboard}
            titulo="Aún no hay datos para mostrar"
            descripcion="Cuando crees proyectos y tareas, aquí verás tu resumen real."
          >
            <Link to={RUTAS.nuevoProyecto} className="btn btn-primary">
              Crear proyecto
            </Link>
          </EstadoVacio>
        </div>
      )
    }

    const tarjetas = [
      { titulo: 'Proyectos activos', valor: resumen.proyectosActivos },
      { titulo: 'Tareas pendientes', valor: resumen.pendientes },
      { titulo: 'Completadas', valor: resumen.completadas },
      { titulo: 'Vencidas', valor: resumen.vencidas },
    ]

    return (
      <>
        <div className="d-flex flex-wrap gap-2 mb-4">
          <Link to={RUTAS.nuevoProyecto} className="btn btn-primary">
            Nuevo proyecto
          </Link>
          <Link to={RUTAS.proyectos} className="btn btn-outline-primary">
            Ver proyectos
          </Link>
          <Link to={RUTAS.tareas} className="btn btn-outline-primary">
            Ver tareas
          </Link>
        </div>

        <ul className="row g-3 list-unstyled mb-4" aria-label="Resumen">
          {tarjetas.map((tarjeta) => (
            <li key={tarjeta.titulo} className="col-6 col-lg-3">
              <div className="tf-card p-3 h-100">
                <p className="text-body-secondary small mb-1">{tarjeta.titulo}</p>
                <p className="h3 mb-0">{tarjeta.valor}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="tf-card p-4 mb-4">
          <h2 className="h5">Progreso</h2>
          <div
            className="progress mb-2"
            role="progressbar"
            aria-label="Progreso de tareas"
            aria-valuenow={resumen.progreso}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-bar" style={{ width: `${resumen.progreso}%` }} />
          </div>
          <p className="text-body-secondary mb-0">
            {resumen.totalTareas === 0
              ? 'Aún no tienes tareas.'
              : `${resumen.completadas} de ${resumen.totalTareas} tareas completadas (${resumen.progreso} %)`}
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="tf-card p-4 h-100">
              <h2 className="h5">Próximas tareas</h2>
              {resumen.proximas.length === 0 ? (
                <p className="text-body-secondary mb-0">
                  No tienes tareas pendientes con fecha límite.
                </p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {resumen.proximas.map((tarea) => (
                    <li
                      key={tarea.id}
                      className="d-flex flex-wrap justify-content-between gap-2 py-2 border-top"
                    >
                      <div>
                        <Link to={RUTAS.proyecto(tarea.projectId)} className="fw-semibold">
                          {tarea.titulo}
                        </Link>
                        <p className="small text-body-secondary mb-0">
                          {nombresProyecto[tarea.projectId] ?? 'Proyecto'}
                        </p>
                      </div>
                      <div className="text-sm-end">
                        {tarea.fechaLimite && (
                          <span className="small text-body-secondary d-block">
                            Vence el {formatearFecha(tarea.fechaLimite.toDate())}
                          </span>
                        )}
                        {estaVencida(tarea) && (
                          <span className="badge text-bg-danger">Vencida</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="tf-card p-4 h-100">
              <h2 className="h5">Proyectos recientes</h2>
              {resumen.recientes.length === 0 ? (
                <p className="text-body-secondary mb-0">No tienes proyectos activos.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {resumen.recientes.map((proyecto) => (
                    <li key={proyecto.id} className="py-2 border-top">
                      <Link to={RUTAS.proyecto(proyecto.id)} className="fw-semibold">
                        {proyecto.nombre}
                      </Link>
                      <p className="small text-body-secondary mb-0">
                        Actualizado el {formatearFecha(proyecto.actualizadoEn.toDate())}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <section>
      <h1 className="h3 mb-1">Panel</h1>
      <p className="text-body-secondary mb-4">{saludo} Este es el resumen de tu trabajo.</p>
      {contenido()}
    </section>
  )
}