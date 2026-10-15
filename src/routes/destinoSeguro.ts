import { RUTAS } from './rutas'

// Solo se acepta volver a rutas internas; nunca a sitios externos.
export function destinoSeguro(estado: unknown): string {
  if (typeof estado === 'object' && estado !== null && 'desde' in estado) {
    const { desde } = estado as { desde: unknown }
    if (typeof desde === 'string' && desde.startsWith('/') && !desde.startsWith('//')) {
      return desde
    }
  }
  return RUTAS.panel
}