// Lightweight GraphQL client
// Sends POST requests to the API endpoint and throws on any GraphQL errors returned in the response body.
const GRAPHQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001/graphql'

export async function gql(query, variables = {}) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join('\n'))
  }

  return json.data
}
