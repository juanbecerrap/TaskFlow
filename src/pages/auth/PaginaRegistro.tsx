import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoContrasena } from '../../components/common/CampoContrasena'
import { CampoTexto } from '../../components/common/CampoTexto'
import { esquemaRegistro, type DatosRegistro } from '../../features/auth/esquemas'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaRegistro() {
  useTituloDocumento('Crear cuenta')
  const [aviso, setAviso] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: '', correo: '', contrasena: '', confirmacion: '' },
  })

  // Temporal: en la Fase 5 aquí se crea la cuenta en Firebase Auth.
  function alEnviar() {
    setAviso('Datos válidos. El registro real se conecta en la Fase 5.')
  }

  return (
    <section>
      <h1 className="h3 mb-1">Crear cuenta</h1>
      <p className="text-body-secondary mb-4">
        Empieza a organizar tus proyectos en minutos.
      </p>

      <form noValidate onSubmit={handleSubmit(alEnviar)}>
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
        <button type="submit" className="btn btn-primary w-100">
          Crear cuenta
        </button>
      </form>

      <div role="status">
        {aviso && <div className="alert alert-info mt-3 mb-0">{aviso}</div>}
      </div>

      <p className="mt-4 mb-0 text-center">
        ¿Ya tienes cuenta? <Link to={RUTAS.iniciarSesion}>Inicia sesión</Link>
      </p>
    </section>
  )
}