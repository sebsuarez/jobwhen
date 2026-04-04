import { createContext, useContext, useEffect, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        setUser(null)
        return null
      }

      setUser(result.user)
      return result.user
    } catch {
      setUser(null)
      return null
    }
  }

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      await refreshUser()
      setIsLoading(false)
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
