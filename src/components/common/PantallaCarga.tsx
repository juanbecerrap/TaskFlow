import { IndicadorCarga } from './IndicadorCarga'

export function PantallaCarga() {
  return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
      <IndicadorCarga texto="Comprobando sesión…" />
    </div>
  )
}