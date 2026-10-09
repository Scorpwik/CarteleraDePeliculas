import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LenisRoot } from './components/LenisRoot'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LenisRoot>
      <App />
    </LenisRoot>
  </StrictMode>,
)
