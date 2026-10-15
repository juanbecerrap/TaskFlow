export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO', { dateStyle: 'long' })
}