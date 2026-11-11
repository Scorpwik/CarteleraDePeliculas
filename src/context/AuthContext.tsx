import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  cargando: boolean
  cerrarSesion: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const TIMEOUT_CARGA_MS = 5000

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    let resuelto = false

    function terminar(nuevaSesion: Session | null) {
      if (!activo || resuelto) return
      resuelto = true
      setSession(nuevaSesion)
      setCargando(false)
    }

    // Si Supabase no responde (proyecto caído, red, etc.), no dejar la UI colgada.
    const timeoutId = window.setTimeout(() => {
      console.error('Timeout al cargar la sesión de Auth')
      terminar(null)
    }, TIMEOUT_CARGA_MS)

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error(error.message)
          terminar(null)
          return
        }
        terminar(data.session)
      })
      .catch((err: unknown) => {
        console.error(err instanceof Error ? err.message : err)
        terminar(null)
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      window.clearTimeout(timeoutId)
      if (!activo) return
      // Tras la carga inicial, el listener sigue actualizando la sesión.
      if (resuelto) {
        setSession(nuevaSesion)
        return
      }
      terminar(nuevaSesion)
    })

    return () => {
      activo = false
      window.clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        cargando,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return ctx
}
