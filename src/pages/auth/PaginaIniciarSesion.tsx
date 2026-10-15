import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoContrasena } from '../../components/common/CampoContrasena'
import { CampoTexto } from '../../components/common/CampoTexto'
import { MensajeError } from '../../components/common/MensajeError'
import { mensajeErrorAuth } from '../../features/auth/errores'
import {
  esquemaInicioSesion,
  type DatosInicioSesion,
} from '../../features/auth/esquemas'
import { iniciarSesion } from '../../features/auth/servicioAuth'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaIniciarSesion() {
  useTituloDocumento('Iniciar sesión')
  const [errorEnvio, setErrorEnvio] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { correo: '', contrasena: '' },
  })

  // Si el acceso funciona, RutaSoloPublica redirige sola al panel.
  async function alEnviar(datos: DatosInicioSesion) {
    setErrorEnvio('')
    try {
      await iniciarSesion(datos)
    } catch (error) {
      setErrorEnvio(mensajeErrorAuth(error))
    }
  }

  return (
    <section>
      <h1 className="h3 mb-1">Iniciar sesión</h1>
      <p className="text-body-secondary mb-4">Accede a tus proyectos y tareas.</p>

      <form noValidate onSubmit={handleSubmit(alEnviar)} aria-busy={isSubmitting}>
        <CampoTexto
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <CampoContrasena
          etiqueta="Contraseña"
          autoComplete="current-password"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      {errorEnvio && (
        <div className="mt-3">
          <MensajeError mensaje={errorEnvio} />
        </div>
      )}

      <p className="mt-4 mb-1 text-center">
        <Link to={RUTAS.recuperarContrasena}>¿Olvidaste tu contraseña?</Link>
      </p>
      <p className="mb-0 text-center">
        ¿No tienes cuenta? <Link to={RUTAS.registro}>Crea una</Link>
      </p>
    </section>
  )
}