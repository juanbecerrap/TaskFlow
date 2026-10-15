import { describe, expect, it } from 'vitest'
import { destinoSeguro } from './destinoSeguro'
import { RUTAS } from './rutas'

describe('destinoSeguro', () => {
  it('acepta rutas internas', () => {
    expect(destinoSeguro({ desde: '/proyectos?orden=nombre' })).toBe(
      '/proyectos?orden=nombre',
    )
  })

  it('rechaza sitios externos y rutas con doble barra', () => {
    expect(destinoSeguro({ desde: 'https://malo.com' })).toBe(RUTAS.panel)
    expect(destinoSeguro({ desde: '//malo.com' })).toBe(RUTAS.panel)
  })

  it('usa el panel si no hay estado válido', () => {
    expect(destinoSeguro(null)).toBe(RUTAS.panel)
    expect(destinoSeguro(undefined)).toBe(RUTAS.panel)
    expect(destinoSeguro({})).toBe(RUTAS.panel)
    expect(destinoSeguro({ desde: 42 })).toBe(RUTAS.panel)
  })
})