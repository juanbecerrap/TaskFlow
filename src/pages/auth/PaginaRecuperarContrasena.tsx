import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoTexto } from '../../components/common/CampoTexto'
import {
  esquemaRecuperacion,
  type DatosRecuperacion,
} from '../../features/auth/esquemas'
import { useTituloDocumento } from '../../hooks/useTituloDocumento'
import { RUTAS } from '../../routes/rutas'

export function PaginaRecuperarContrasena() {
  useTituloDocumento('Recuperar contraseña')
  const [aviso, setAviso] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosRecuperacion>({
    resolver: zodResolver(esquemaRecuperacion),
    defaultValues: { correo: '' },
  })

  // Temporal: en la Fase 5 aquí se envía el correo con Firebase Auth.
  function alEnviar() {
    setAviso('Datos válidos. El envío real del correo se conecta en la Fase 5.')
  }

  return (
    <section>
      <h1 className="h3 mb-1">Recuperar contraseña</h1>
      <p className="text-body-secondary mb-4">
        Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
      </p>

      <form noValidate onSubmit={handleSubmit(alEnviar)}>
        <CampoTexto
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <button type="submit" className="btn btn-primary w-100">
          Enviar enlace
        </button>
      </form>

      <div role="status">
        {aviso && <div className="alert alert-info mt-3 mb-0">{aviso}</div>}
      </div>

      <p className="mt-4 mb-0 text-center">
        <Link to={RUTAS.iniciarSesion}>Volver a iniciar sesión</Link>
      </p>
    </section>
  )
}