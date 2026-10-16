import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Ningún test debe abrir conexiones reales ni depender del archivo .env.
vi.mock('../lib/firebase', () => ({ app: {}, auth: {}, db: {} }))

// Las páginas se importan al navegar: se amplía el margen de espera de findBy*.
configure({ asyncUtilTimeout: 5000 })

afterEach(() => {
  cleanup()
})