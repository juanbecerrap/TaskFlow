import { useAuth } from '../features/auth/useAuth'
import { useTituloDocumento } from '../hooks/useTituloDocumento'

function formatearFecha(texto: string | undefined) {
  if (!texto) return '—'
  const fecha = new Date(texto)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString('es-CO', { dateStyle: 'long' })
}

export function PaginaPerfil() {
  useTituloDocumento('Perfil')
  const { usuario } = useAuth()

  if (!usuario) return null

  return (
    <section>
      <h1 className="h3 mb-4">Perfil</h1>
      <div className="tf-card p-4">
        <dl className="row mb-0">
          <dt className="col-sm-4">Nombre</dt>
          <dd className="col-sm-8">{usuario.displayName ?? 'Sin nombre'}</dd>
          <dt className="col-sm-4">Correo electrónico</dt>
          <dd className="col-sm-8">{usuario.email ?? '—'}</dd>
          <dt className="col-sm-4">Cuenta creada</dt>
          <dd className="col-sm-8 mb-0">{formatearFecha(usuario.metadata.creationTime)}</dd>
        </dl>
      </div>
    </section>
  )
}