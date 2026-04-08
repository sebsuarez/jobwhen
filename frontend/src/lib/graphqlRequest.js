const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

export async function graphqlRequest(query, variables = {}) {
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
