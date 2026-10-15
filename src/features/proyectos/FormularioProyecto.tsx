import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoAreaTexto } from '../../components/common/CampoAreaTexto'
import { CampoTexto } from '../../components/common/CampoTexto'
import { MensajeError } from '../../components/common/MensajeError'
import { mensajeErrorAuth } from '../auth/errores'
import { esquemaProyecto, type DatosProyecto } from './esquemas'

interface FormularioProyectoProps {
  valoresIniciales?: DatosProyecto
  textoEnviar: string
  textoEnviando: string
  rutaCancelar: string
  alEnviar: (datos: DatosProyecto) => Promise<void>
}

export function FormularioProyecto({
  valoresIniciales = { nombre: '', descripcion: '' },
  textoEnviar,
  textoEnviando,
  rutaCancelar,
  alEnviar,
}: FormularioProyectoProps) {
  const [errorEnvio, setErrorEnvio] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosProyecto>({
    resolver: zodResolver(esquemaProyecto),
    defaultValues: valoresIniciales,
  })

  async function enviar(datos: DatosProyecto) {
    setErrorEnvio('')
    try {
      await alEnviar(datos)
    } catch (error) {
      setErrorEnvio(mensajeErrorAuth(error))
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(enviar)} aria-busy={isSubmitting}>
      <CampoTexto
        etiqueta="Nombre"
        autoComplete="off"
        error={errors.nombre?.message}
        {...register('nombre')}
      />
      <CampoAreaTexto
        etiqueta="Descripción"
        rows={4}
        ayuda="Opcional. Máximo 500 caracteres."
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      {errorEnvio && (
        <div className="mb-3">
          <MensajeError mensaje={errorEnvio} />
        </div>
      )}

      <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? textoEnviando : textoEnviar}
        </button>
        <Link to={rutaCancelar} className="btn btn-outline-secondary">
          Cancelar
        </Link>
      </div>
    </form>
  )
}