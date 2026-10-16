import type { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import { estaVencida, fechaATexto, textoAFecha } from './fechas'

const marca = (fecha: Date) => ({ toDate: () => fecha }) as unknown as Timestamp

const AHORA = new Date(2026, 9, 15, 21, 0)

describe('textoAFecha', () => {
  it('convierte una fecha válida a las 12:00 locales', () => {
    const fecha = textoAFecha('2026-10-20')
    expect(fecha?.getFullYear()).toBe(2026)
    expect(fecha?.getMonth()).toBe(9)
    expect(fecha?.getDate()).toBe(20)
    expect(fecha?.getHours()).toBe(12)
  })

  it('rechaza vacío, formato incorrecto y fechas que no existen', () => {
    expect(textoAFecha('')).toBeNull()
    expect(textoAFecha('20/10/2026')).toBeNull()
    expect(textoAFecha('2026-02-31')).toBeNull()
    expect(textoAFecha('2026-13-01')).toBeNull()
  })
})

describe('fechaATexto', () => {
  it('devuelve cadena vacía si no hay fecha', () => {
    expect(fechaATexto(null)).toBe('')
  })

  it('es la inversa de textoAFecha', () => {
    const fecha = textoAFecha('2026-01-05') as Date
    expect(fechaATexto(marca(fecha))).toBe('2026-01-05')
  })
})

describe('estaVencida', () => {
  it('es true con fecha anterior a hoy y tarea sin completar', () => {
    const fechaLimite = marca(new Date(2026, 9, 14, 12))
    expect(estaVencida({ estado: 'pendiente', fechaLimite }, AHORA)).toBe(true)
    expect(estaVencida({ estado: 'en_progreso', fechaLimite }, AHORA)).toBe(true)
  })

  it('es false si vence hoy o más adelante', () => {
    expect(
      estaVencida({ estado: 'pendiente', fechaLimite: marca(new Date(2026, 9, 15, 12)) }, AHORA),
    ).toBe(false)
    expect(
      estaVencida({ estado: 'pendiente', fechaLimite: marca(new Date(2026, 9, 16, 12)) }, AHORA),
    ).toBe(false)
  })

  it('es false si está completada o no tiene fecha', () => {
    const pasada = marca(new Date(2026, 0, 1, 12))
    expect(estaVencida({ estado: 'completada', fechaLimite: pasada }, AHORA)).toBe(false)
    expect(estaVencida({ estado: 'pendiente', fechaLimite: null }, AHORA)).toBe(false)
  })
})