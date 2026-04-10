import { graphqlRequest } from '../lib/graphqlRequest'

const LEADERBOARDS_QUERY = `
  query Leaderboards {
    topUsersByLevel {
      userId
      fullName
      avatar
      value
    }
    topUsersByCompletedChallenges {
      userId
      fullName
      avatar
      value
    }
    topUsersByApplicationsSubmitted {
      userId
      fullName
      avatar
      value
    }
  }
`

export async function fetchLeaderboards() {
  const data = await graphqlRequest(LEADERBOARDS_QUERY)
  return {
    byLevel: data.topUsersByLevel ?? [],
    byChallenges: data.topUsersByCompletedChallenges ?? [],
    byApplications: data.topUsersByApplicationsSubmitted ?? [],
  }
}
