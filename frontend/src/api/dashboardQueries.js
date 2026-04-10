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

const MOOD_INSIGHTS_QUERY = `
  query MoodInsights {
    myMoodHistory {
      moodId
      moodScore
      reflection
      checkedInAt
    }
    myBurnoutAlerts {
      alertId
      triggerReason
      supportiveMessage
      createdAt
      resolved
    }
  }
`

// Dashboard Mutations (modify or writing data)
const UPDATE_GOAL_PROGRESS_MUTATION = `
  mutation UpdateGoalProgress($goalId: Int!, $delta: Int!) {
    updateGoalProgress(goalId: $goalId, delta: $delta) {
      ok
      xpAwarded
      goal {
        goalId
        goalType
        targetCount
        currentCount
        isCompleted
      }
    }
  }
`

const SET_GOAL_MUTATION = `
  mutation SetGoal($goalType: String!, $targetCount: Int!) {
    setGoal(goalType: $goalType, targetCount: $targetCount) {
      ok
      message
      goal {
        goalId
        goalType
        targetCount
        currentCount
        isCompleted
      }
    }
  }
`

const REMOVE_GOAL_MUTATION = `
  mutation RemoveGoal($goalType: String!) {
    removeGoal(goalType: $goalType) {
      ok
      message
    }
  }
`

const LOG_MOOD_CHECKIN_MUTATION = `
  mutation LogMoodCheckin($moodScore: Int!, $reflection: String) {
    logMoodCheckin(moodScore: $moodScore, reflection: $reflection) {
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

export async function fetchMoodInsights() {
  const data = await graphqlRequest(MOOD_INSIGHTS_QUERY)
  return {
    myMoodHistory: data.myMoodHistory ?? [],
    myBurnoutAlerts: data.myBurnoutAlerts ?? [],
  }
}

export async function logMoodCheckin(moodScore, reflection = null) {
  const data = await graphqlRequest(LOG_MOOD_CHECKIN_MUTATION, { moodScore, reflection })
  return data.logMoodCheckin
}

export async function updateGoalProgress(goalId, delta) {
  const data = await graphqlRequest(UPDATE_GOAL_PROGRESS_MUTATION, { goalId, delta })
  return data.updateGoalProgress
}

export async function setGoal(goalType, targetCount) {
  const data = await graphqlRequest(SET_GOAL_MUTATION, { goalType, targetCount })
  return data.setGoal
}

// kept for potential future use 
// currently the dashboard always shows all 3 fixed goal categories
export async function removeGoal(goalType) {
  const data = await graphqlRequest(REMOVE_GOAL_MUTATION, { goalType })
  return data.removeGoal
}
