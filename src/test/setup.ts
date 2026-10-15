import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Ningún test debe abrir conexiones reales ni depender del archivo .env.
vi.mock('../lib/firebase', () => ({ app: {}, auth: {}, db: {} }))

afterEach(() => {
  cleanup()
})