import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoContrasena } from '../../components/common/CampoContrasena'
import { CampoTexto } from '../../components/common/CampoTexto'
import { MensajeError } from '../../components/common/MensajeError'
import { mensajeErrorAuth } from '../../features/auth/errores'
import { esquemaRegistro, type DatosRegistro } from '../../features/auth/esquemas'
import { registrarUsuario } from '../../features/auth/servicioAuth'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaRegistro() {
  useTituloDocumento('Crear cuenta')
  const [errorEnvio, setErrorEnvio] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: '', correo: '', contrasena: '', confirmacion: '' },
  })

  // Si el registro funciona, RutaSoloPublica redirige sola al panel.
  async function alEnviar(datos: DatosRegistro) {
    setErrorEnvio('')
    try {
      await registrarUsuario(datos)
    } catch (error) {
      setErrorEnvio(mensajeErrorAuth(error))
    }
  }

  return (
    <section>
      <h1 className="h3 mb-1">Crear cuenta</h1>
      <p className="text-body-secondary mb-4">
        Empieza a organizar tus proyectos en minutos.
      </p>

      <form noValidate onSubmit={handleSubmit(alEnviar)} aria-busy={isSubmitting}>
        <CampoTexto
          etiqueta="Nombre"
          autoComplete="name"
          error={errors.nombre?.message}
          {...register('nombre')}
        />
        <CampoTexto
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <CampoContrasena
          etiqueta="Contraseña"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, con letras y números."
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
        <CampoContrasena
          etiqueta="Confirmación de contraseña"
          autoComplete="new-password"
          error={errors.confirmacion?.message}
          {...register('confirmacion')}
        />
        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      {errorEnvio && (
        <div className="mt-3">
          <MensajeError mensaje={errorEnvio} />
        </div>
      )}

      <p className="mt-4 mb-0 text-center">
        ¿Ya tienes cuenta? <Link to={RUTAS.iniciarSesion}>Inicia sesión</Link>
      </p>
    </section>
  )
}