import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoContrasena } from '../../components/common/CampoContrasena'
import { CampoTexto } from '../../components/common/CampoTexto'
import { esquemaInicioSesion, type DatosInicioSesion } from '../../features/auth/esquemas'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaIniciarSesion() {
  useTituloDocumento('Iniciar sesión')
  const [aviso, setAviso] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosInicioSesion>({
    resolver: zodResolver(esquemaInicioSesion),
    defaultValues: { correo: '', contrasena: '' },
  })

  // Temporal: en la Fase 5 aquí se llama a Firebase Auth.
  function alEnviar() {
    setAviso('Datos válidos. El inicio de sesión real se conecta en la Fase 5.')
  }

  return (
    <section>
      <h1 className="h3 mb-1">Iniciar sesión</h1>
      <p className="text-body-secondary mb-4">Accede a tus proyectos y tareas.</p>

      <form noValidate onSubmit={handleSubmit(alEnviar)}>
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
        <button type="submit" className="btn btn-primary w-100">
          Iniciar sesión
        </button>
      </form>

      <div role="status">
        {aviso && <div className="alert alert-info mt-3 mb-0">{aviso}</div>}
      </div>

      <p className="mt-4 mb-1 text-center">
        <Link to={RUTAS.recuperarContrasena}>¿Olvidaste tu contraseña?</Link>
      </p>
      <p className="mb-0 text-center">
        ¿No tienes cuenta? <Link to={RUTAS.registro}>Crea una</Link>
      </p>
    </section>
  )
}