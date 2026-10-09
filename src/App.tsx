import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { RutaProtegida } from './components/RutaProtegida'
import { Login } from './pages/Login'
import { Registro } from './pages/Registro'
import { Buscar } from './pages/Buscar'
import { MiLista } from './pages/MiLista'
import { Titulo } from './pages/Titulo'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route element={<RutaProtegida />}>
              <Route path="/" element={<Buscar />} />
              <Route path="/mi-lista" element={<MiLista />} />
              <Route path="/titulo/:id" element={<Titulo modo="editable" />} />
              <Route
                path="/explorar/:tipo/:tmdbId"
                element={<Titulo modo="lectura" />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
