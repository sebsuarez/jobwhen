import { graphqlRequest } from '../lib/graphqlRequest'


// Dashboard Queries (fetching data, think of it like a GET request)
const ACTIVE_GOALS_QUERY = `
  query ActiveGoals {
    activeGoals {
      goalId
      goalType
      targetCount
      currentCount
      startDate
      endDate
      isCompleted
    }
  }
`

// Dashboard Mutations (modify or writing data)
const SUBMIT_MOOD_CHECKIN_MUTATION = `
  mutation SubmitMoodCheckin($moodScore: Int!, $reflection: String) {
    submitMoodCheckin(moodScore: $moodScore, reflection: $reflection) {
      ok
      message
    }
  }
`

// Exported API functions
export async function fetchActiveGoals() {
  const data = await graphqlRequest(ACTIVE_GOALS_QUERY)
  return data.activeGoals
}

export async function submitMoodCheckin(moodScore, reflection = null) {
  const data = await graphqlRequest(SUBMIT_MOOD_CHECKIN_MUTATION, { moodScore, reflection })
  return data.submitMoodCheckin
}
