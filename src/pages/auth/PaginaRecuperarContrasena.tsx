import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoTexto } from '../../components/common/CampoTexto'
import { MensajeError } from '../../components/common/MensajeError'
import { mensajeErrorAuth } from '../../features/auth/errores'
import {
  esquemaRecuperacion,
  type DatosRecuperacion,
} from '../../features/auth/esquemas'
import { enviarCorreoRecuperacion } from '../../features/auth/servicioAuth'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaRecuperarContrasena() {
  useTituloDocumento('Recuperar contraseña')
  const [errorEnvio, setErrorEnvio] = useState('')
  const [enviado, setEnviado] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosRecuperacion>({
    resolver: zodResolver(esquemaRecuperacion),
    defaultValues: { correo: '' },
  })

  async function alEnviar(datos: DatosRecuperacion) {
    setErrorEnvio('')
    setEnviado(false)
    try {
      await enviarCorreoRecuperacion(datos)
      setEnviado(true)
    } catch (error) {
      setErrorEnvio(mensajeErrorAuth(error))
    }
  }

  return (
    <section>
      <h1 className="h3 mb-1">Recuperar contraseña</h1>
      <p className="text-body-secondary mb-4">
        Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
      </p>

      <form noValidate onSubmit={handleSubmit(alEnviar)} aria-busy={isSubmitting}>
        <CampoTexto
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <div role="status">
        {enviado && (
          <div className="alert alert-success mt-3 mb-0">
            Si existe una cuenta con ese correo, recibirás un enlace para crear una
            nueva contraseña. Revisa también la carpeta de spam.
          </div>
        )}
      </div>

      {errorEnvio && (
        <div className="mt-3">
          <MensajeError mensaje={errorEnvio} />
        </div>
      )}

      <p className="mt-4 mb-0 text-center">
        <Link to={RUTAS.iniciarSesion}>Volver a iniciar sesión</Link>
      </p>
    </section>
  )
}