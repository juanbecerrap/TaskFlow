import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { ProveedorAuth } from './features/auth/ProveedorAuth'
import { rutasApp } from './routes/rutasApp'

const router = createBrowserRouter(rutasApp)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProveedorAuth>
      <RouterProvider router={router} />
    </ProveedorAuth>
  </StrictMode>,
)