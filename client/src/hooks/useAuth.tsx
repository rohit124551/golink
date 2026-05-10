import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, signIn, signOut, getSession } from '../lib/supabase.ts'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  session: Session | null | undefined
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    getSession().then(setSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) throw error
  }

  const logout = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, loading: session === undefined }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
