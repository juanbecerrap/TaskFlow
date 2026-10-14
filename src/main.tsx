import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { rutasApp } from './routes/rutasApp'

const router = createBrowserRouter(rutasApp)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)