import { createContext, useContext, useEffect, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

const AuthContext = createContext(null)

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  const result = await response.json()

  if (!response.ok || result.errors?.length) {
    throw new Error(result.errors?.[0]?.message || 'GraphQL request failed.')
  }

  return result.data
}

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

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}

export { graphqlRequest }
