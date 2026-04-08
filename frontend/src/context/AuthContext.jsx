import { useEffect, useState } from 'react'

import { AuthContext } from './authContext'
import { graphqlRequest } from '../lib/graphqlRequest'

export function AuthProvider({ children }) {
  // global auth state — null means no logged-in user
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // fetches the current session user from the backend and updates state
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
            headline
            bio
            location
            avatar
            currentLevel
            currentXp
            streakDays
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

  // calls the logout mutation and clears user state regardless of response
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

  // on mount, restore session from the server-side cookie if one exists
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
