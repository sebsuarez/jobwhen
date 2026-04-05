import { createContext, useEffect, useState } from 'react'

import { graphqlRequest } from '../lib/graphqlRequest'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const data = await graphqlRequest(`
        query Me {
          me {
            userId
            email
            fullName
            googleSub
            createdAt
            role {
              roleId
              roleName
            }
          }
        }
      `)

      setUser(data.me)
      return data.me
    } catch {
      setUser(null)
      return null
    }
  }

  const logout = async () => {
    try {
      await graphqlRequest(`
        mutation Logout {
          logout {
            ok
            message
          }
        }
      `)
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
