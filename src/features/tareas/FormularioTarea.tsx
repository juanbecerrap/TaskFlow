import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { CampoAreaTexto } from '../../components/common/CampoAreaTexto'
import { CampoSelect } from '../../components/common/CampoSelect'
import { CampoTexto } from '../../components/common/CampoTexto'
import { MensajeError } from '../../components/common/MensajeError'
import { ESTADOS_TAREA, PRIORIDADES_TAREA } from '../../types/modelos'
import { mensajeErrorAuth } from '../auth/errores'
import { esquemaTarea, type DatosTarea } from './esquemas'
import { ETIQUETA_ESTADO, ETIQUETA_PRIORIDAD } from './etiquetas'

const VALORES_VACIOS: DatosTarea = {
  titulo: '',
  descripcion: '',
  estado: 'pendiente',
  prioridad: 'media',
  fechaLimite: '',
}

interface FormularioTareaProps {
  valoresIniciales?: DatosTarea
  textoEnviar: string
  textoEnviando: string
  rutaCancelar: string
  alEnviar: (datos: DatosTarea) => Promise<void>
}

export function FormularioTarea({
  valoresIniciales = VALORES_VACIOS,
  textoEnviar,
  textoEnviando,
  rutaCancelar,
  alEnviar,
}: FormularioTareaProps) {
  const [errorEnvio, setErrorEnvio] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DatosTarea>({
    resolver: zodResolver(esquemaTarea),
    defaultValues: valoresIniciales,
  })

  async function enviar(datos: DatosTarea) {
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
        etiqueta="Título"
        autoComplete="off"
        error={errors.titulo?.message}
        {...register('titulo')}
      />
      <CampoAreaTexto
        etiqueta="Descripción"
        rows={4}
        ayuda="Opcional. Máximo 1000 caracteres."
        error={errors.descripcion?.message}
        {...register('descripcion')}
      />

      <div className="row">
        <div className="col-sm-6">
          <CampoSelect
            etiqueta="Estado"
            error={errors.estado?.message}
            {...register('estado')}
          >
            {ESTADOS_TAREA.map((estado) => (
              <option key={estado} value={estado}>
                {ETIQUETA_ESTADO[estado]}
              </option>
            ))}
          </CampoSelect>
        </div>
        <div className="col-sm-6">
          <CampoSelect
            etiqueta="Prioridad"
            error={errors.prioridad?.message}
            {...register('prioridad')}
          >
            {PRIORIDADES_TAREA.map((prioridad) => (
              <option key={prioridad} value={prioridad}>
                {ETIQUETA_PRIORIDAD[prioridad]}
              </option>
            ))}
          </CampoSelect>
        </div>
      </div>

      <CampoTexto
        etiqueta="Fecha límite"
        type="date"
        ayuda="Opcional."
        error={errors.fechaLimite?.message}
        {...register('fechaLimite')}
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